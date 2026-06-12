// EduBook Mock Database & Initial Data

export const initialUsers = [
  { id: "u1", name: "M. Martin", email: "martin.prof@ecole.fr", role: "teacher", avatar: "MM" },
  { id: "u2", name: "Mme. Dubois", email: "dubois.prof@ecole.fr", role: "teacher", avatar: "MD" },
  { id: "u3", name: "M. Petit", email: "petit.prof@ecole.fr", role: "teacher", avatar: "MP" },
  { id: "u4", name: "Mme. Lemaire", email: "lemaire.prof@ecole.fr", role: "teacher", avatar: "ML" },
  { id: "u5", name: "Admin EduBook", email: "admin@ecole.fr", role: "admin", avatar: "AD" }
];

export const initialEquipment = [
  // Category: Informatique
  {
    id: "eq-01",
    name: "Chariot de 15 Tablettes iPads",
    category: "Informatique",
    ref: "INF-IPAD-01",
    description: "Chariot mobile contenant 15 tablettes iPad configurées pour les classes. Livré avec chargeurs et stylets.",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "eq-02",
    name: "Ordinateur Portable Enseignant Dell",
    category: "Informatique",
    ref: "INF-LAP-02",
    description: "PC Portable Dell 15 pouces haute performance avec suite Office et adaptateur HDMI/VGA pour cours.",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "eq-03",
    name: "Imprimante 3D Ultimaker S3",
    category: "Informatique",
    ref: "INF-3D-03",
    description: "Imprimante 3D de précision pour projets créatifs ou cours de technologie. Bobines de PLA incluses sur demande.",
    status: "maintenance",
    imageUrl: "https://images.unsplash.com/photo-1615840287214-7fe58a8b668f?w=500&auto=format&fit=crop&q=60"
  },
  
  // Category: Audiovisuel
  {
    id: "eq-04",
    name: "Vidéoprojecteur Epson Nomade",
    category: "Audiovisuel",
    ref: "AV-PROJ-01",
    description: "Vidéoprojecteur portable haute définition, entrée HDMI/VGA, avec télécommande et écran de projection pliable.",
    status: "reserved",
    imageUrl: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "eq-05",
    name: "Caméra 4K Sony & Trépied",
    category: "Audiovisuel",
    ref: "AV-CAM-02",
    description: "Kit caméra vidéo 4K pour club journalisme ou cours d'arts plastiques. Fourni avec trépied et micro externe.",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "eq-06",
    name: "Microphone Sans Fil Cravate Rode",
    category: "Audiovisuel",
    ref: "AV-MIC-03",
    description: "Ensemble émetteur-récepteur microphone sans fil Rode Wireless GO II, idéal pour enregistrements et podcasts.",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&auto=format&fit=crop&q=60"
  },
  
  // Category: Sciences
  {
    id: "eq-07",
    name: "Microscope Numérique Optika",
    category: "Sciences",
    ref: "SCI-MIC-01",
    description: "Microscope de laboratoire avec caméra USB intégrée pour projection sur grand écran lors des cours de SVT.",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "eq-08",
    name: "Mallette Capteurs Physique-Chimie Pasco",
    category: "Sciences",
    ref: "SCI-PAS-02",
    description: "Lot de capteurs sans fil (température, pression, pH, conductivité) pour expériences scientifiques sur tablettes.",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1532187640685-46750d12799a?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "eq-09",
    name: "Squelette Anatomique 'Oscar'",
    category: "Sciences",
    ref: "SCI-SQU-03",
    description: "Modèle anatomique de squelette humain à taille réelle sur support mobile à roulettes pour cours de biologie.",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "eq-10",
    name: "Kit d'Expérience Électricité Collège",
    category: "Sciences",
    ref: "SCI-ELEC-04",
    description: "Lot complet comprenant générateurs, lampes, fils, ampèremètres et voltmètres pour travaux pratiques d'électricité.",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format&fit=crop&q=60"
  },
  
  // Category: Robotique
  {
    id: "eq-11",
    name: "Kit Robotique Lego Mindstorms EV3",
    category: "Robotique",
    ref: "ROB-LEGO-01",
    description: "Kit de construction de robots programmables avec moteurs et capteurs. Idéal pour s'initier au code en technologie.",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "eq-12",
    name: "Kit Starter Arduino (x5)",
    category: "Robotique",
    ref: "ROB-ARD-02",
    description: "Lot de 5 kits de prototypage électronique Arduino Uno avec cartes d'extension, LEDs et résistances.",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "eq-13",
    name: "Drone DJI Tello Edu (x2)",
    category: "Robotique",
    ref: "ROB-DJI-03",
    description: "Mini-drones éducatifs programmables en Scratch ou Python. Filets de protection de vol inclus.",
    status: "outoforder",
    imageUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=500&auto=format&fit=crop&q=60"
  },
  
  // Category: Sport
  {
    id: "eq-14",
    name: "Kit Chronomètre & Balises Course d'Orientation",
    category: "Sport",
    ref: "SPO-CO-01",
    description: "Lot de 20 puces électroniques, 5 boîtiers électroniques et 20 balises pour les cours d'EPS de course d'orientation.",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1508962914676-134849a727f0?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "eq-15",
    name: "Lot de 10 Ballons de Basket + Pompe",
    category: "Sport",
    ref: "SPO-BAS-02",
    description: "Ballons de basketball taille 7 de qualité d'entraînement, livrés dans un sac de transport avec pompe électrique.",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "eq-16",
    name: "Table de Tennis de Table Cornilleau",
    category: "Sport",
    ref: "SPO-PING-03",
    description: "Table de ping-pong pliante d'extérieur avec filet métallique rigide. Raquettes et balles fournies par le gymnase.",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=500&auto=format&fit=crop&q=60"
  },
  
  // Category: Bibliothèque
  {
    id: "eq-17",
    name: "Lot de 10 Liseuses Kindle Paperwhite",
    category: "Bibliothèque",
    ref: "BIB-KND-01",
    description: "Liseuses électroniques préchargées avec des classiques de la littérature française pour les cours de français.",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1544822417-e8104598595c?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "eq-18",
    name: "Encyclopédie Universalis (20 volumes)",
    category: "Bibliothèque",
    ref: "BIB-ENC-02",
    description: "Édition papier complète de l'encyclopédie pour travaux de recherche documentaire au CDI.",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1513001900722-370f803f498d?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "eq-19",
    name: "Casque Réalité Virtuelle Oculus Quest 2",
    category: "Informatique",
    ref: "INF-VR-04",
    description: "Casque VR autonome pour projets éducatifs (visites virtuelles de musées, immersion en géographie).",
    status: "reserved",
    imageUrl: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "eq-20",
    name: "Mallette de Sonorisation Portable",
    category: "Audiovisuel",
    ref: "AV-SON-04",
    description: "Enceinte nomade sur batterie avec micro sans fil, lecteur Bluetooth et USB pour kermesses ou spectacles scolaires.",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop&q=60"
  }
];

export const initialReservations = [
  {
    id: "res-01",
    equipmentId: "eq-04", // Projecteur
    userId: "u1", // M. Martin
    userName: "M. Martin",
    startDate: new Date(Date.now() - 3600000 * 2).toISOString().split('T')[0], // Started today
    endDate: new Date(Date.now() + 3600000 * 4).toISOString().split('T')[0],
    timeSlot: "08:00 - 12:00",
    purpose: "Projection d'un documentaire historique sur la Seconde Guerre mondiale en classe de 3ème.",
    status: "approved",
    requestDate: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "res-02",
    equipmentId: "eq-19", // Oculus VR
    userId: "u2", // Mme. Dubois
    userName: "Mme. Dubois",
    startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: "14:00 - 16:00",
    purpose: "Visite virtuelle de la Rome Antique en cours de Latin.",
    status: "approved",
    requestDate: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "res-03",
    equipmentId: "eq-01", // iPads
    userId: "u3", // M. Petit
    userName: "M. Petit",
    startDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // In 2 days
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    timeSlot: "09:00 - 11:00",
    purpose: "Séance d'apprentissage des bases de la programmation sur Swift Playgrounds.",
    status: "pending",
    requestDate: new Date().toISOString()
  },
  {
    id: "res-04",
    equipmentId: "eq-07", // Microscope SVT
    userId: "u4", // Mme Lemaire
    userName: "Mme. Lemaire",
    startDate: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], // Past reservation
    endDate: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    timeSlot: "10:00 - 12:00",
    purpose: "Observation des cellules d'épiderme d'oignon au microscope.",
    status: "approved",
    requestDate: new Date(Date.now() - 86400000 * 7).toISOString()
  }
];

export const initialActivities = [
  {
    id: "act-01",
    userName: "M. Martin",
    action: "a réservé le",
    itemName: "Vidéoprojecteur Epson Nomade",
    time: "Il y a 2 heures"
  },
  {
    id: "act-02",
    userName: "Mme. Dubois",
    action: "a rendu le",
    itemName: "Caméra 4K Sony & Trépied",
    time: "Hier"
  },
  {
    id: "act-03",
    userName: "M. Petit",
    action: "a demandé à réserver le",
    itemName: "Chariot de 15 Tablettes iPads",
    time: "Aujourd'hui, 08h30"
  },
  {
    id: "act-04",
    userName: "Admin",
    action: "a marqué en maintenance le",
    itemName: "Imprimante 3D Ultimaker S3",
    time: "Hier, 17h00"
  }
];
