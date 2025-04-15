# Robinhood to Koinly Converter

A production-ready web application that converts Robinhood crypto transaction PDF statements into Koinly-compatible CSV format for tax reporting.

## Features

- Convert Robinhood PDF statements to Koinly CSV format
- Support for multiple transaction types (buys, sells, transfers)
- Date range filtering
- Secure file handling
- Modern, responsive UI
- Dark/light theme support

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/robinhood-to-koinly.git
cd robinhood-to-koinly
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements/requirements.txt
```

4. Create a `.env` file:
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration.

## Running the Application

### Development
```bash
flask run
```

### Production
```bash
gunicorn src.app:app
```

## Usage

1. Visit the application in your web browser
2. Upload your Robinhood PDF statements
3. Select the processing mode and date range
4. Click "Convert to Koinly Format"
5. Download the generated CSV file
6. Import the CSV into Koinly

## Supported Transaction Types

- Buys and sells
- Transfers in and out

## Security

- All file processing happens in your browser
- No data is stored on the server
- Files are automatically deleted after conversion
- Secure HTTPS connections
- No personal information required

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 