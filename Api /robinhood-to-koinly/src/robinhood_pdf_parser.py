import os
import re
from datetime import datetime
import pandas as pd
from PyPDF2 import PdfReader

class RobinhoodPDFParser:
    def __init__(self, statements_dir):
        self.statements_dir = statements_dir
        self.transactions = []
        self.mode = None
        self.start_date = None
        self.end_date = None

    def parse_statements(self, mode='All Transactions with Transfers', start_date=None, end_date=None):
        """Parse all PDF statements in the directory."""
        self.mode = mode
        self.start_date = start_date
        self.end_date = end_date
        
        for filename in os.listdir(self.statements_dir):
            if filename.endswith('.pdf'):
                filepath = os.path.join(self.statements_dir, filename)
                self._parse_pdf(filepath)
        
        # Sort transactions by date
        self.transactions.sort(key=lambda x: datetime.strptime(x['Date'].split()[0], '%Y-%m-%d'))

    def _parse_pdf(self, filepath):
        """Parse a single PDF file."""
        reader = PdfReader(filepath)
        
        for page in reader.pages:
            text = page.extract_text()
            self._parse_page(text)

    def _parse_page(self, text):
        """Parse a single page of text."""
        # Split text into lines and process each line
        lines = text.split('\n')
        current_transaction = None
        
        for line in lines:
            # Look for transaction start
            if 'Transaction Type:' in line:
                if current_transaction:
                    self._process_transaction(current_transaction)
                current_transaction = {'Date': None, 'Label': None}
            
            # Extract transaction details
            if current_transaction:
                if 'Date:' in line:
                    date_str = line.split('Date:')[1].strip()
                    try:
                        date = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S %Z')
                        current_transaction['Date'] = date.strftime('%Y-%m-%d %H:%M:%S UTC')
                    except ValueError:
                        pass
                
                elif 'Transaction Type:' in line:
                    tx_type = line.split('Transaction Type:')[1].strip()
                    current_transaction['Label'] = self._map_transaction_type(tx_type)
                
                elif 'Received Amount:' in line:
                    amount = line.split('Received Amount:')[1].strip()
                    current_transaction['Received Amount'] = amount.split()[0]
                    current_transaction['Received Currency'] = amount.split()[1]
                
                elif 'Sent Amount:' in line:
                    amount = line.split('Sent Amount:')[1].strip()
                    current_transaction['Sent Amount'] = amount.split()[0]
                    current_transaction['Sent Currency'] = amount.split()[1]
        
        # Process the last transaction
        if current_transaction:
            self._process_transaction(current_transaction)

    def _map_transaction_type(self, tx_type):
        """Map Robinhood transaction types to Koinly labels."""
        tx_type = tx_type.lower()
        if 'buy' in tx_type:
            return 'buy'
        elif 'sell' in tx_type:
            return 'sell'
        elif 'transfer in' in tx_type:
            return 'transfer in'
        elif 'transfer out' in tx_type:
            return 'transfer out'
        return tx_type

    def _process_transaction(self, transaction):
        """Process a single transaction and add it to the list if it matches the criteria."""
        if not all(k in transaction for k in ['Date', 'Label']):
            return
        
        # Check date range
        if self.start_date and self.end_date:
            tx_date = datetime.strptime(transaction['Date'].split()[0], '%Y-%m-%d')
            if tx_date < self.start_date or tx_date > self.end_date:
                return
        
        # Check mode
        if self.mode == 'Only Transfers' and transaction['Label'] not in ['transfer in', 'transfer out']:
            return
        elif self.mode == 'Trades Only' and transaction['Label'] not in ['buy', 'sell']:
            return
        
        self.transactions.append(transaction)

    def save_to_csv(self, output_file):
        """Save transactions to a CSV file in Koinly format."""
        if not self.transactions:
            return
        
        df = pd.DataFrame(self.transactions)
        df.to_csv(output_file, index=False) 