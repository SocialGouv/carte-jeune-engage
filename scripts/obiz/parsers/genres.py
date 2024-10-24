import json
from typing import List


def get_genre_names(file_paths: List[str]) -> dict:
    """
    Extraire tous les noms de sous-genres des fichiers JSON spécifiés
    """
    all_genres = {}

    for file_path in file_paths:
        source_name = file_path.split('/')[-1].split('.')[0]

        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)

        genre_names = []

        for catalogue in data.get('catalogues', []):
            for cat in catalogue.get('catalogue', []):
                for genre in cat.get('genres', []):
                    for gen in genre.get('genre', []):
                        if 'genres_nom' in gen:
                            genre_names.append(gen['genres_nom'])

        all_genres[source_name] = genre_names

    return all_genres