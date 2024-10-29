from datetime import datetime
import pytz


def convert_date_format(date_str: str) -> str:
    """
    Convertit une date du format "DD/MM/YYYY HH:MM:SS" vers le format ISO "YYYY-MM-DDThh:mm:ss.000Z"

    Args:
        date_str (str): Date au format "DD/MM/YYYY HH:MM:SS"

    Returns:
        str: Date au format ISO "YYYY-MM-DDThh:mm:ss.000Z"
    """
    try:
        if date_str == '':
            return '1970-01-01T00:00:00.000Z'

        date_obj = datetime.strptime(date_str, "%d/%m/%Y %H:%M:%S")

        utc_date = pytz.utc.localize(date_obj)

        iso_date = utc_date.strftime("%Y-%m-%dT%H:%M:%S.000Z")

        return iso_date
    except (ValueError, TypeError):
        return None