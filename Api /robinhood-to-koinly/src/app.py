import os
from flask import Flask, render_template, request, send_file, flash
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import tempfile
import shutil
from dotenv import load_dotenv
from robinhood_pdf_parser import RobinhoodPDFParser

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-here')

# Configure upload folder
UPLOAD_FOLDER = tempfile.mkdtemp()
ALLOWED_EXTENSIONS = {'pdf'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

def get_available_years():
    """Get list of available years for date selection."""
    current_year = datetime.now().year
    years = list(range(current_year - 2, current_year + 1))
    return years

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_date_range(date_range, start_date=None, end_date=None):
    """Calculate start and end dates based on selected range."""
    today = datetime.now()
    
    if date_range == 'all':
        return None, None
    elif date_range == 'ytd':
        start = datetime(today.year, 1, 1)
        end = today
    elif date_range == 'mtd':
        start = datetime(today.year, today.month, 1)
        end = today
    elif date_range == 'last_month':
        if today.month == 1:
            start = datetime(today.year - 1, 12, 1)
        else:
            start = datetime(today.year, today.month - 1, 1)
        end = datetime(today.year, today.month, 1) - timedelta(days=1)
    elif date_range.isdigit():
        year = int(date_range)
        start = datetime(year, 1, 1)
        end = datetime(year, 12, 31)
    elif date_range == '3years':
        start = datetime(today.year - 2, 1, 1)
        end = datetime(today.year, 12, 31)
    elif date_range == 'custom':
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d')
            end = datetime.strptime(end_date, '%Y-%m-%d')
        except (ValueError, TypeError):
            flash('Invalid date format for custom range')
            return None, None
    else:
        return None, None
    
    return start, end

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        try:
            if 'file[]' not in request.files:
                flash('No files selected')
                return render_template('index.html', years=get_available_years())
            
            files = request.files.getlist('file[]')
            mode = request.form.get('mode', 'All Transactions with Transfers')
            date_range = request.form.get('date_range', 'ytd')
            start_date = request.form.get('start_date')
            end_date = request.form.get('end_date')
            
            if not files or files[0].filename == '':
                flash('No files selected')
                return render_template('index.html', years=get_available_years())

            temp_dir = None
            output_dir = None
            try:
                temp_dir = tempfile.mkdtemp()
                output_dir = tempfile.mkdtemp()
                
                saved_files = []
                for file in files:
                    if file and allowed_file(file.filename):
                        filename = secure_filename(file.filename)
                        filepath = os.path.join(temp_dir, filename)
                        file.save(filepath)
                        saved_files.append(filepath)
                
                if not saved_files:
                    flash('No valid PDF files were uploaded')
                    return render_template('index.html', years=get_available_years())
                
                start_date, end_date = get_date_range(date_range, start_date, end_date)
                
                parser = RobinhoodPDFParser(statements_dir=temp_dir)
                parser.parse_statements(
                    mode=mode,
                    start_date=start_date,
                    end_date=end_date
                )
                
                output_file = os.path.join(output_dir, 'koinly_transfers.csv')
                parser.save_to_csv(output_file)
                
                transactions = parser.transactions
                transfers_in = sum(1 for t in transactions if t.get('Label') == 'transfer in')
                transfers_out = sum(1 for t in transactions if t.get('Label') == 'transfer out')
                buys = sum(1 for t in transactions if t.get('Label') == 'buy')
                sells = sum(1 for t in transactions if t.get('Label') == 'sell')
                
                summary_data = get_summary_data(transactions)
                
                if date_range == 'all' or start_date is None or end_date is None:
                    display_start = 'All Time'
                    display_end = 'All Time'
                else:
                    try:
                        display_start = start_date.strftime('%Y-%m-%d')
                        display_end = end_date.strftime('%Y-%m-%d')
                    except (AttributeError, ValueError):
                        display_start = 'All Time'
                        display_end = 'All Time'
                
                app.config['UPLOAD_FOLDER'] = output_dir
                
                return render_template(
                    'results.html',
                    mode=mode,
                    start_date=display_start,
                    end_date=display_end,
                    total_transactions=len(transactions),
                    transfers_in=transfers_in,
                    transfers_out=transfers_out,
                    buys=buys,
                    sells=sells,
                    error_files=[],
                    summary_data=summary_data
                )
                
            except Exception as e:
                flash(f'Error processing files: {str(e)}')
                return render_template('index.html', years=get_available_years())
                
            finally:
                if temp_dir and os.path.exists(temp_dir):
                    shutil.rmtree(temp_dir, ignore_errors=True)
                
        except Exception as e:
            flash(f'Upload error: {str(e)}')
            return render_template('index.html', years=get_available_years())

    return render_template('index.html', years=get_available_years())

@app.route('/download')
def download():
    csv_file = os.path.join(app.config['UPLOAD_FOLDER'], 'koinly_transfers.csv')
    return send_file(
        csv_file,
        mimetype='text/csv',
        as_attachment=True,
        download_name='koinly_transfers.csv'
    )

def get_summary_data(transactions):
    deposits = {}
    withdrawals = {}
    trades = {}
    total_transactions = len(transactions)
    earliest_date = None
    latest_date = None
    
    for tx in transactions:
        try:
            tx_date = datetime.strptime(tx['Date'].split()[0], '%Y-%m-%d')
            if earliest_date is None or tx_date < earliest_date:
                earliest_date = tx_date
            if latest_date is None or tx_date > latest_date:
                latest_date = tx_date
        except (ValueError, IndexError):
            pass

        if tx['Label'] == 'transfer in':
            asset = tx['Received Currency']
            amount = float(tx['Received Amount'])
            if asset not in deposits:
                deposits[asset] = {'count': 0, 'total': 0}
            deposits[asset]['count'] += 1
            deposits[asset]['total'] += amount
        elif tx['Label'] == 'transfer out':
            asset = tx['Sent Currency']
            amount = float(tx['Sent Amount'])
            if asset not in withdrawals:
                withdrawals[asset] = {'count': 0, 'total': 0}
            withdrawals[asset]['count'] += 1
            withdrawals[asset]['total'] += amount
        else:
            sent_asset = tx['Sent Currency']
            received_asset = tx['Received Currency']
            if sent_asset and received_asset:
                pair = f"{sent_asset}/{received_asset}"
                if pair not in trades:
                    trades[pair] = {
                        'count': 0,
                        'total_sent': 0,
                        'total_received': 0
                    }
                trades[pair]['count'] += 1
                if tx['Sent Amount']:
                    trades[pair]['total_sent'] += float(tx['Sent Amount'])
                if tx['Received Amount']:
                    trades[pair]['total_received'] += float(tx['Received Amount'])
    
    return {
        'deposits': deposits,
        'withdrawals': withdrawals,
        'trades': trades,
        'total_transactions': total_transactions,
        'date_range': {
            'earliest': earliest_date.strftime('%Y-%m-%d') if earliest_date else 'N/A',
            'latest': latest_date.strftime('%Y-%m-%d') if latest_date else 'N/A'
        }
    }

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=int(os.getenv('PORT', 5000))) 