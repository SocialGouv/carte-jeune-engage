import json
from typing import List


def get_sousgenre_names(file_paths: List[str]) -> dict:
    """
    Extraire tous les noms de sous-genres des fichiers JSON spécifiés
    """
    all_sousgenres = {}

    for file_path in file_paths:
        source_name = file_path.split('/')[-1].split('.')[0]

        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)

        sousgenre_names = []

        for catalogue in data.get('catalogues', []):
            for cat in catalogue.get('catalogue', []):
                for genre in cat.get('genres', []):
                    for gen in genre.get('genre', []):
                        for sousgenre in gen.get('sousgenres', []):
                            for sg in sousgenre.get('sousgenre', []):
                                if 'sousgenres_nom' in sg:
                                    sousgenre_names.append(sg['sousgenres_nom'])

        all_sousgenres[source_name] = sousgenre_names

    return all_sousgenres