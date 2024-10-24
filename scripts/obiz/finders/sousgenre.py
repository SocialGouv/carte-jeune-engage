import json
from typing import Dict, List
from colorama import init, Fore, Style

def format_reduction(reduction: float, variable_remise: str, is_variable: str) -> str:
    """
    Formate la réduction en fonction des conditions
    """
    if is_variable == 'True':
        return variable_remise
    return f"{reduction:.1f}"


def format_price(price_str: str) -> str:
    """
    Formate un prix en string avec 2 décimales et le symbole €
    """
    try:
        # Remplace la virgule par un point pour la conversion
        price_float = float(price_str.replace(',', '.'))
        # Formate le prix avec 2 décimales et le symbole €
        return f"{price_float:.2f} €"
    except (ValueError, AttributeError):
        return "Prix non disponible"


def calculate_reduction(prix_public: str, prix_reduc: str) -> float:
    """
    Calcule le pourcentage de réduction entre deux prix
    """
    try:
        prix_public_float = float(prix_public.replace(',', '.'))
        prix_reduc_float = float(prix_reduc.replace(',', '.'))

        if prix_public_float == 0:
            return 0.0

        reduction = ((prix_public_float - prix_reduc_float) / prix_public_float) * 100
        return reduction
    except (ValueError, AttributeError):
        return 0.0


def search_sousgenre_articles(file_paths: List[str], sousgenre_name: str) -> Dict[str, List[Dict]]:
    """
    Recherche un sous-genre par son nom dans plusieurs fichiers et retourne tous ses articles associés
    """
    all_results = {}

    for file_path in file_paths:
        source_name = file_path.split('/')[-1].split('.')[0]

        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)

        results = []

        for catalogue in data.get('catalogues', []):
            for cat in catalogue.get('catalogue', []):
                for genre in cat.get('genres', []):
                    for gen in genre.get('genre', []):
                        for sousgenre in gen.get('sousgenres', []):
                            for sg in sousgenre.get('sousgenre', []):
                                if sg.get('sousgenres_nom', '').lower() == sousgenre_name.lower():
                                    sousgenre_info = {
                                        'nom': sg.get('sousgenres_nom', ''),
                                        'id': sg.get('sousgenres_id'),
                                        'genre_nom': gen.get('genres_nom', ''),
                                        'url': sg.get('sousgenres_url', ''),
                                        'description': sg.get('sousgenres_descriptif', {}).get('#cdata-section', ''),
                                        'articles': []
                                    }

                                    for articles in sg.get('articles', []):
                                        for article in articles.get('article', []):
                                            if article['articles_actif'] == "True":
                                                article_info = {
                                                    'nom': article.get('articles_nom', ''),
                                                    'prix_public': article.get('articles_prix_public', ''),
                                                    'prix_reduc_ttc': article.get('articles_puttc', ''),
                                                    'variable': article.get('articles_valeur_variable', ''),
                                                    'variable_remise': article.get('articles_remise_btob', ''),
                                                    'code': article.get('articles_code', ''),
                                                    'type': article.get('articles_type', ''),
                                                    'description': article.get('articles_descriptif', {}).get(
                                                        '#cdata-section', '')
                                                }
                                                sousgenre_info['articles'].append(article_info)

                                    results.append(sousgenre_info)

        if results:
            all_results[source_name] = results

    return all_results


def print_sousgenre_details(results: Dict[str, List[Dict]]) -> None:
    """
    Affiche les détails d'un sous-genre et ses articles de manière formatée pour chaque source
    """
    if not results:
        print("Aucun sous-genre trouvé avec ce nom dans aucune source.")
        return

    for source, source_results in results.items():
        print(f"\n{'=' * 20} Source: {source} {'=' * 20}")

        for result in source_results:
            print(f"\nSous-genre: {result['nom']} (genre - {result['genre_nom']})")
            print(f"ID : {result['id']}")
            print(f"URL: {result['url']}")
            print("\nArticles associés:")
            print("-" * 30)

            if not result['articles']:
                print("Aucun article trouvé pour ce sous-genre.")

            for article in result['articles']:
                prix_public = article['prix_public']
                prix_reduc = article['prix_reduc_ttc']
                reduction = calculate_reduction(prix_public, prix_reduc)

                formatted_reduction = format_reduction(
                    reduction,
                    article['variable_remise'],
                    article['variable']
                )

                print(f"\nNom: {Style.BRIGHT}{Fore.BLUE}{article['nom']}{Style.RESET_ALL}")
                print(f"Réduction: {Style.BRIGHT}{Fore.GREEN}{formatted_reduction}%{Style.RESET_ALL}")
                print(f"Valeur variable : {'Oui' if article['variable'] == 'True' else 'Non'}")
                print(f"Code: {article['code']}")
                print(f"Type: {article['type']}")
                print(f"Prix public: {format_price(prix_public)}")
                print(f"Prix avec réduc ttc : {format_price(prix_reduc)}")