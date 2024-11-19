import pytz
from datetime import datetime


def convert_date_format(date_str: str) -> str:
    """
    Convertit une date du format "DD/MM/YYYY HH:MM:SS" (Paris timezone)
    vers le format ISO "YYYY-MM-DDThh:mm:ss.000Z" (UTC)

    Args:
        date_str (str): Date au format "DD/MM/YYYY HH:MM:SS"

    Returns:
        str: Date au format ISO "YYYY-MM-DDThh:mm:ss.000Z"
    """
    try:
        if date_str == '':
            current_year = datetime.now().year
            date_str = f"31/12/{current_year} 23:59:59"

        naive_date = datetime.strptime(date_str, "%d/%m/%Y %H:%M:%S")

        paris_tz = pytz.timezone('Europe/Paris')

        paris_date = paris_tz.localize(naive_date)

        utc_date = paris_date.astimezone(pytz.UTC)

        iso_date = utc_date.strftime("%Y-%m-%dT%H:%M:%S.000Z")

        return iso_date
    except (ValueError, TypeError):
        return None