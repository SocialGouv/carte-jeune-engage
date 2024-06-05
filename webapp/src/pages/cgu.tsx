import { ChevronLeftIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Divider,
  Heading,
  ListItem,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAuth } from "~/providers/Auth";

const SubHeading = ({ children }: { children: React.ReactNode }) => (
  <Heading as="h2" size={{ base: "lg", lg: "2xl" }} mt={10} color="black">
    {children}
  </Heading>
);

const SubSubHeading = ({ children }: { children: React.ReactNode }) => (
  <Heading as="h3" size={{ base: "md", lg: "xl" }} mt={2} color="black">
    {children}
  </Heading>
);

export default function CGU() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <VStack
      spacing={8}
      align="left"
      mt={!!user ? 0 : 12}
      py={!!user ? 10 : 0}
      px={{ base: 6, lg: 2 }}
      fontWeight="medium"
      color="secondaryText"
    >
      {!!user && (
        <Button
          colorScheme="whiteBtn"
          onClick={() => {
            router.back();
          }}
          size="md"
          width={8}
          iconSpacing={0}
          px={0}
          rightIcon={<ChevronLeftIcon w={6} h={6} color="black" />}
        />
      )}
      <Heading
        as="h1"
        size={{ base: "xl", lg: "3xl" }}
        fontWeight="extrabold"
        color="black"
      >
        Conditions générales d’utilisation
      </Heading>
      <Text fontSize={{ base: "lg", lg: "2xl" }}>22/03/2024</Text>
      <Divider />
      <Text fontSize={{ base: "lg", lg: "2xl" }}>
        Les présentes conditions générales d’utilisation Jeunes Engagés (dites «
        CGU Jeunes Engagés ») fixent le cadre juridique de l’expérimentation de
        la Plateforme Carte Jeune Engagé et définissent les conditions d’accès
        et d’utilisation des services par l’Utilisateur. Toute utilisation de la
        Plateforme est subordonnée à l’acceptation préalable et au respect
        intégral des présentes conditions générales d’utilisation.
      </Text>
      <Box>
        <SubHeading>Article 1er - Définitions</SubHeading>
        <Divider mt={3} mb={4} />
        <VStack spacing={4} fontSize={{ base: "md", lg: "2xl" }} align="start">
          <Text>
            “L’Éditeur” : désigne la Fabrique Numérique des ministères sociaux
            qui développe la Plateforme sous la supervision du Délégué
            interministériel à la jeunesse.
          </Text>
          <Text>
            “Entreprise Engagée” : désigne toute personne morale qui adhère à la
            Plateforme et propose des offres commerciales aux Utilisateurs.
          </Text>
          <Text>
            “Utilisateur” ou “Jeune Engagé” : désigne toute personne physique
            qui dispose d’un compte sur la Plateforme.
          </Text>
          <Text>
            “Plateforme” : désigne l’application web Carte Jeune Engagé qui
            permet d'accéder au Service.
          </Text>
          <Text>
            “Service” : désigne toutes les fonctionnalités offertes par la
            Plateforme pour répondre à ses finalités.
          </Text>
        </VStack>
      </Box>
      <Box>
        <SubHeading>Article 2 - Présentation de la plateforme</SubHeading>
        <Divider mt={3} mb={4} />
        <VStack spacing={4} fontSize={{ base: "md", lg: "2xl" }} align="start">
          <Text>
            La Plateforme a pour objectif de permettre aux jeunes inscrits dans
            un parcours d’insertion éligible d’accéder à des biens et services
            essentiels à tarif solidaire.
          </Text>
          <Text>
            Concrètement, la Plateforme propose aux Jeunes Engagés différentes
            offres commerciales et réductions présentées par des Entreprises
            Engagées.
          </Text>
        </VStack>
      </Box>
      <Box>
        <SubHeading>Article 3 - Conditions d’accès</SubHeading>
        <Divider mt={3} mb={4} />
        <VStack spacing={4} fontSize={{ base: "md", lg: "2xl" }} align="start">
          <Text>
            L’Utilisateur de la Plateforme doit répondre aux conditions
            suivantes :
          </Text>
          <UnorderedList pl={4} mt={1}>
            <ListItem>avoir entre 18 et 25 ans ;</ListItem>
            <ListItem>
              être inscrit dans l’un des parcours d’insertion suivants : contrat
              d’engagement jeune (CEJ), école de la 2ème chance, établissement
              pour l’insertion dans l’emploi (EPIDE), service civique.
            </ListItem>
          </UnorderedList>
          <Text>
            L’accès est libre et gratuit à tout Utilisateur qui remplit les
            conditions d’accès. La non-satisfaction de l’une des conditions
            d’accès entraîne de plein droit et sans préavis la radiation de
            l’Utilisateur.
            <br />
            Le présent contrat peut être résilié de plein droit en cas d’arrêt
            du Service sans que le Jeune Engagé ne puisse prétendre à aucune
            indemnisation d’aucune sorte.
          </Text>
        </VStack>
      </Box>
      <Box>
        <SubHeading>Article 4 - Fonctionnalités</SubHeading>
        <Divider mt={3} mb={4} />
        <VStack spacing={4} fontSize={{ base: "md", lg: "2xl" }} align="start">
          <SubSubHeading>4.1 Création du compte</SubSubHeading>
          <Text>
            La création du compte nécessite de renseigner les informations
            suivantes :
          </Text>
          <UnorderedList pl={4} mt={1}>
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
          <Text>
            L’Utilisateur accède à son compte en renseignant son numéro de
            téléphone.
          </Text>
          <SubSubHeading>4.2 Utiliser un code de réduction</SubSubHeading>
          <Text>
            L’Utilisateur peut bénéficier des avantages de plusieurs manières :
            via un code promo à usage unique, un code barre à usage unique à
            scanner en caisse, via sa Carte Jeune Engagé à présenter uniquement
            en magasin ou encore via des liens non indexés vers une offre
            spéciale ou un lien vers une offre existante. L’offre est
            automatiquement créditée au profit de l’Utilisateur.
          </Text>
        </VStack>
      </Box>
      <Box>
        <SubHeading>Article 5 - Responsabilités</SubHeading>
        <Divider mt={3} mb={4} />
        <VStack spacing={4} fontSize={{ base: "md", lg: "2xl" }} align="start">
          <SubSubHeading>5.1 L’Éditeur de la Plateforme</SubSubHeading>
          <Text>
            Les sources des informations diffusées sur la Plateforme sont
            réputées fiables mais la Plateforme ne garantit pas qu’elle soit
            exempte de défauts, d’erreurs ou d’omissions.
          </Text>
          <Text>
            L'Éditeur se contente de mettre à disposition les offres
            commerciales des Entreprises Engagées et ne peut en aucune
            circonstance être tenu pour responsable des éventuels différends
            entre l’Utilisateur et l’Entreprise Engagée.
          </Text>
          <Text>
            L’Éditeur ne peut voir sa responsabilité recherchée dans le cadre
            des éventuels dysfonctionnements et dommages causés par les biens et
            services proposés sur la Plateforme.{" "}
          </Text>
          <Text>
            L’Éditeur s’autorise à suspendre ou révoquer n’importe quel compte
            et toutes les actions réalisées par ce biais, s’il estime que
            l’usage réalisé du service porte préjudice à son image ou ne
            correspond pas aux exigences de sécurité.
          </Text>
          <Text>
            L’Éditeur s’engage à la sécurisation de la Plateforme, notamment en
            prenant toutes les mesures nécessaires permettant de garantir la
            sécurité et la confidentialité des informations fournies. L’Éditeur
            fournit les moyens nécessaires et raisonnables pour assurer un accès
            continu, sans contrepartie financière, à la Plateforme.
          </Text>
          <Text>
            Il se réserve la liberté de faire évoluer, de modifier ou de
            suspendre, sans préavis, la Plateforme pour des raisons de
            maintenance ou pour tout autre motif jugé nécessaire.
          </Text>
          <SubSubHeading>5.2 L’Utilisateur</SubSubHeading>
          <Text>
            L’utilisation du Service est personnelle, à ce titre l’Utilisateur
            n’est pas autorisé à céder ou à permettre l’utilisation du Service
            par un tiers. L’Utilisateur s’engage à fournir une photo pour
            bénéficier d’avantages uniquement disponibles grâce à la Carte Jeune
            Engagé.
          </Text>
          <Text>
            Il est rappelé que toute personne procédant à une fausse déclaration
            pour elle-même ou pour autrui s’expose, notamment, aux sanctions
            prévues à l’article 441-1 du code pénal, prévoyant des peines
            pouvant aller jusqu’à trois ans d’emprisonnement et 45 000 euros
            d’amende.
          </Text>
          <Text>
            L’Utilisateur s’engage à ne pas mettre en ligne de contenus ou
            informations contraires aux dispositions légales et réglementaires
            en vigueur.
          </Text>
          <Text>
            L’Utilisateur s’engage à communiquer des données strictement
            nécessaires à sa demande. Il veille particulièrement aux données
            sensibles notamment les données relatives aux opinions
            philosophiques, politiques, syndicales et religieuses.
          </Text>
        </VStack>
      </Box>
      <Box>
        <SubHeading>
          Article 6 - Mise à jour des conditions générales d’utilisation
        </SubHeading>
        <Divider mt={3} mb={4} />
        <VStack spacing={4} fontSize={{ base: "md", lg: "2xl" }} align="start">
          <Text>
            Les termes des présentes CGU peuvent être amendés à tout moment,
            sans préavis, en fonction des modifications apportées à la
            Plateforme, de l’évolution de la législation ou pour tout autre
            motif jugé nécessaire. Chaque modification donne lieu à une nouvelle
            version qui est acceptée par l’Utilisateur.
          </Text>
        </VStack>
      </Box>
    </VStack>
  );
}
