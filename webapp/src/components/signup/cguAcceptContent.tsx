import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Icon,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { HiArrowRight } from "react-icons/hi2";
import { SignupFormData } from "~/utils/form/formSchemas";

const CGUAcceptContent = ({ onClick }: { onClick: () => void }) => {
  return (
    <Flex flexDir="column" h="full" pt={8} pb={12}>
      <Heading fontWeight="extrabold" size="xl" px={8}>
        Veuillez accepter les conditions d'utilisation
      </Heading>
      <Divider mt={8} />
      <Box maxH="full" overflowY={"scroll"} pt={8}>
        <Box px={8} pb={36} fontSize={"sm"}>
          <Heading size="sm" fontWeight="extrabold" mb={4}>
            Conditions générales d’utilisation “Jeunes Engagés”
          </Heading>
          <Text color="secondaryText" mb={4}>
            Les présentes conditions générales d’utilisation Jeunes Engagés
            (dites « CGU Jeunes Engagés ») fixent le cadre juridique de
            l’expérimentation de la Plateforme Carte Jeune Engagé et définissent
            les conditions d’accès et d’utilisation des services par
            l’Utilisateur.
            <br />
            Toute utilisation de la Plateforme est subordonnée à l’acceptation
            préalable et au respect intégral des présentes conditions générales
            d’utilisation.
          </Text>
          <Text fontWeight={"bold"} mb={1}>
            Article 1er - Définitions
          </Text>
          <Divider mb={2} mt={1} />
          <Text color="secondaryText" mb={4}>
            “L’Éditeur” : désigne la Fabrique Numérique des ministères sociaux
            qui développe la Plateforme sous la supervision du Délégué
            interministériel à la jeunesse.
          </Text>
          <Text color="secondaryText" mb={4}>
            “Entreprise Engagée” : désigne toute personne morale qui adhère à la
            Plateforme et propose des offres commerciales aux Utilisateurs.
          </Text>
          <Text color="secondaryText" mb={4}>
            “Utilisateur” ou “Jeune Engagé” : désigne toute personne physique
            qui dispose d’un compte sur la Plateforme.
          </Text>
          <Text color="secondaryText" mb={4}>
            “Plateforme” : désigne l’application web Carte Jeune Engagé qui
            permet d'accéder au Service.
          </Text>
          <Text color="secondaryText" mb={4}>
            “Service” : désigne toutes les fonctionnalités offertes par la
            Plateforme pour répondre à ses finalités.
          </Text>
          <Heading size="sm" fontWeight="extrabold" mb={1}>
            Article 2 - Présentation de la plateforme
          </Heading>
          <Divider mb={2} mt={1} />
          <Text color="secondaryText" mb={4}>
            La Plateforme a pour objectif de permettre aux jeunes inscrits dans
            un parcours d’insertion éligible d’accéder à des biens et services
            essentiels à tarif solidaire.
            <br />
            Concrètement, la Plateforme propose aux Jeunes Engagés différentes
            offres commerciales et réductions présentées par des Entreprises
            Engagées.
          </Text>
          <Heading size="sm" fontWeight="extrabold" mb={1}>
            Article 3 - Conditions d’accès
          </Heading>
          <Divider mb={2} mt={1} />
          <Text color="secondaryText" mb={2}>
            L’Utilisateur de la Plateforme doit répondre aux conditions
            suivantes :
          </Text>
          <UnorderedList pl={4} color="secondaryText" mb={4}>
            <ListItem>avoir entre 18 et 25 ans ;</ListItem>
            <ListItem>
              être inscrit dans l’un des parcours d’insertion suivants : contrat
              d’engagement jeune (CEJ), école de la 2ème chance, établissement
              pour l’insertion dans l’emploi (EPIDE), service civique.
            </ListItem>
          </UnorderedList>
          <Text color="secondaryText" mb={4}>
            L’accès est libre et gratuit à tout Utilisateur qui remplit les
            conditions d’accès. La non-satisfaction de l’une des conditions
            d’accès entraîne de plein droit et sans préavis la radiation de
            l’Utilisateur.
          </Text>
          <Text color="secondaryText" mb={4}>
            Le présent contrat peut être résilié de plein droit en cas d’arrêt
            du Service sans que le Jeune Engagé ne puisse prétendre à aucune
            indemnisation d’aucune sorte.
          </Text>
          <Heading size="sm" fontWeight="extrabold" mb={1}>
            Article 4 - Fonctionnalités
          </Heading>
          <Divider mb={2} mt={1} />
          <Text color="secondaryText" mb={2} fontWeight={"bold"}>
            4.1 Création du compte
          </Text>
          <Text color="secondaryText" mb={4}>
            La création du compte nécessite de renseigner les informations
            suivantes :
          </Text>
          <UnorderedList mb={4} pl={4} color="secondaryText">
            <ListItem>nom,</ListItem>
            <ListItem>prénom,</ListItem>
            <ListItem>âge,</ListItem>
            <ListItem>numéro de téléphone,</ListItem>
            <ListItem>adresse postale,</ListItem>
            <ListItem>
              photo récente pour les réductions en magasin ou l’accès aux salles
              de sport.
            </ListItem>
          </UnorderedList>
          <Text color="secondaryText" mb={4}>
            L’Utilisateur accède à son compte en renseignant son numéro de
            téléphone.
          </Text>
          <Text color="secondaryText" mb={4} fontWeight={"bold"}>
            4.2 Utiliser un code de réduction
          </Text>
          <Text color="secondaryText" mb={4}>
            L’Utilisateur peut bénéficier des avantages de plusieurs manières :
            via un code promo à usage unique, un code barre à usage unique à
            scanner en caisse, via sa Carte Jeune Engagé à présenter uniquement
            en magasin ou encore via des liens non indexés vers une offre
            spéciale ou un lien vers une offre existante. L’offre est
            automatiquement créditée au profit de l’Utilisateur.
          </Text>
          <Heading size="sm" fontWeight="extrabold" mb={1}>
            Article 5 - Responsabilités
          </Heading>
          <Divider mb={2} mt={1} />
          <Text color="secondaryText" mb={4} fontWeight={"bold"}>
            5.1 L’Éditeur de la Plateforme
          </Text>
          <Text color="secondaryText" mb={4}>
            Les sources des informations diffusées sur la Plateforme sont
            réputées fiables mais la Plateforme ne garantit pas qu’elle soit
            exempte de défauts, d’erreurs ou d’omissions.
            <br />
            L'Éditeur se contente de mettre à disposition les offres
            commerciales des Entreprises Engagées et ne peut en aucune
            circonstance être tenu pour responsable des éventuels différends
            entre l’Utilisateur et l’Entreprise Engagée.
            <br />
            L’Éditeur ne peut voir sa responsabilité recherchée dans le cadre
            des éventuels dysfonctionnements et dommages causés par les biens et
            services proposés sur la Plateforme.
            <br />
            L’Éditeur s’autorise à suspendre ou révoquer n’importe quel compte
            et toutes les actions réalisées par ce biais, s’il estime que
            l’usage réalisé du service porte préjudice à son image ou ne
            correspond pas aux exigences de sécurité.
            <br />
            L’Éditeur s’engage à la sécurisation de la Plateforme, notamment en
            prenant toutes les mesures nécessaires permettant de garantir la
            sécurité et la confidentialité des informations fournies. L’Éditeur
            fournit les moyens nécessaires et raisonnables pour assurer un accès
            continu, sans contrepartie financière, à la Plateforme.
            <br />
            Il se réserve la liberté de faire évoluer, de modifier ou de
            suspendre, sans préavis, la Plateforme pour des raisons de
            maintenance ou pour tout autre motif jugé nécessaire.
          </Text>
          <Text color="secondaryText" mb={4} fontWeight={"bold"}>
            5.2 L’Utilisateur
          </Text>
          <Text color="secondaryText" mb={4}>
            L’utilisation du Service est personnelle, à ce titre l’Utilisateur
            n’est pas autorisé à céder ou à permettre l’utilisation du Service
            par un tiers. L’Utilisateur s’engage à fournir une photo pour
            bénéficier d’avantages uniquement disponibles grâce à la Carte Jeune
            Engagé. Il est rappelé que toute personne procédant à une fausse
            déclaration pour elle-même ou pour autrui s’expose, notamment, aux
            sanctions prévues à l’article 441-1 du code pénal, prévoyant des
            peines pouvant aller jusqu’à trois ans d’emprisonnement et 45 000
            euros d’amende. L’Utilisateur s’engage à ne pas mettre en ligne de
            contenus ou informations contraires aux dispositions légales et
            réglementaires en vigueur. L’Utilisateur s’engage à communiquer des
            données strictement nécessaires à sa demande. Il veille
            particulièrement aux données sensibles notamment les données
            relatives aux opinions philosophiques, politiques, syndicales et
            religieuses.
          </Text>
          <Heading size="sm" fontWeight="extrabold" mb={1}>
            Article 6 - Mise à jour des conditions générales d’utilisation
          </Heading>
          <Divider mb={2} mt={1} />
          <Text color="secondaryText" mb={4}>
            Les termes des présentes CGU peuvent être amendés à tout moment,
            sans préavis, en fonction des modifications apportées à la
            Plateforme, de l’évolution de la législation ou pour tout autre
            motif jugé nécessaire. Chaque modification donne lieu à une nouvelle
            version qui est acceptée par l’Utilisateur.
          </Text>
        </Box>
        <Flex
          direction="column"
          alignItems={"center"}
          borderTopWidth={1}
          px={8}
          pt={3}
          pb={6}
          position={"fixed"}
          bottom={0}
          backgroundColor={"bgWhite"}
          w="full"
        >
          <Text color="disabled" fontWeight={"medium"} fontSize={14}>
            Vous devez accepter pour continuer
          </Text>
          <Button
            size="lg"
            rightIcon={<Icon as={HiArrowRight} w={6} h={6} />}
            w={"full"}
            mt={4}
            onClick={onClick}
          >
            J'accepte
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};

export default CGUAcceptContent;
