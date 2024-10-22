import json
from parsers.articles import get_article_names
from parsers.sousgenres import get_sousgenre_names
from finders.sousgenre import search_sousgenre_articles, print_sousgenre_details

def main():
    file_paths = [
        'inputs/reduccine.fr-preprod.json',
        'inputs/reduckdo.fr-preprod.json',
        'inputs/reducparc.fr-preprod.json'
    ]

    try:
        while True:
            print("\nQue souhaitez-vous faire ?")
            print("1. Afficher tous les noms d'articles")
            print("2. Afficher tous les noms de sous-genres")
            print("3. Rechercher un sous-genre spécifique")
            print("4. Quitter")

            choice = input("\nVotre choix (1-4): ")

            if choice == "1":
                all_articles = get_article_names(file_paths)
                print("\nListe des noms d'articles par source :")
                for source, articles in all_articles.items():
                    print(f"\n{'-' * 20} {source} {'-' * 20}")
                    for name in articles:
                        print(f"- {name}")

            elif choice == "2":
                all_sousgenres = get_sousgenre_names(file_paths)
                print("\nListe des noms de sous-genres par source :")
                for source, sousgenres in all_sousgenres.items():
                    print(f"\n{'-' * 20} {source} {'-' * 20}")
                    for name in sousgenres:
                        print(f"- {name}")

            elif choice == "3":
                search_name = input("\nEntrez le nom du sous-genre à rechercher: ")
                results = search_sousgenre_articles(file_paths, search_name)
                print_sousgenre_details(results)

            elif choice == "4":
                print("Au revoir!")
                break

            else:
                print("Choix invalide. Veuillez réessayer.")

    except FileNotFoundError as e:
        print(f"Le fichier n'a pas été trouvé: {str(e)}")
    except json.JSONDecodeError as e:
        print(f"Erreur lors de la lecture du fichier JSON: {str(e)}")
    except Exception as e:
        print(f"Une erreur est survenue : {str(e)}")

if __name__ == "__main__":
    main()