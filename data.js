// data.js — base interne Tablée

export const AISLES = [
  { id: 'veg',    name: 'Fruits & Légumes',       emoji: '🥬' },
  { id: 'meat',   name: 'Viandes & Charcuterie',  emoji: '🥩' },
  { id: 'dairy',  name: 'Crémerie & Œufs',        emoji: '🧀' },
  { id: 'pantry', name: 'Épicerie & Condiments',  emoji: '🧂' },
  { id: 'frozen', name: 'Surgelés',               emoji: '❄️' },
  { id: 'misc',   name: 'Divers',                 emoji: '🛒' },
];

export const CATEGORIES = [
  { id: 'viande',      name: 'Viande',           emoji: '🥩' },
  { id: 'volaille',    name: 'Volaille',         emoji: '🍗' },
  { id: 'poisson',     name: 'Poisson',          emoji: '🐟' },
  { id: 'vege',        name: 'Végétarien',       emoji: '🥗' },
  { id: 'mijote',      name: 'Mijotés',          emoji: '🍲' },
  { id: 'rapide',      name: 'Plats rapides',    emoji: '⚡' },
  { id: 'eco',         name: 'Plats économiques', emoji: '💰' },
  { id: 'famille',     name: 'Plats familiaux',  emoji: '👨‍👩‍👧' },
  { id: 'monde',       name: 'Plats du monde',   emoji: '🌍' },
  { id: 'four',        name: 'Plats au four',    emoji: '🔥' },
  { id: 'sauce',       name: 'Plats en sauce',   emoji: '🥘' },
  { id: 'autres',      name: 'Autres',           emoji: '🗂️' },
];

export const UNITS = ['g', 'kg', 'ml', 'cl', 'l', 'pc', 'cc', 'cs', 'pincée'];

// ingrédient → { aisle, emoji, defaultUnit }
// la clé est le nom canonique en minuscules. Le matching tolère pluriel et accents.
export const INGREDIENT_DB = {
  // Fruits & Légumes
  'oignon':            { aisle: 'veg', emoji: '🧅', unit: 'pc' },
  'echalote':          { aisle: 'veg', emoji: '🧅', unit: 'pc' },
  'ail':               { aisle: 'veg', emoji: '🧄', unit: 'gousse' },
  'gousse d\'ail':     { aisle: 'veg', emoji: '🧄', unit: 'gousse' },
  'carotte':           { aisle: 'veg', emoji: '🥕', unit: 'pc' },
  'pomme de terre':    { aisle: 'veg', emoji: '🥔', unit: 'pc' },
  'tomate':            { aisle: 'veg', emoji: '🍅', unit: 'pc' },
  'tomates concassees':{ aisle: 'pantry', emoji: '🥫', unit: 'g' },
  'concentre de tomates': { aisle: 'pantry', emoji: '🥫', unit: 'cs' },
  'courgette':         { aisle: 'veg', emoji: '🥒', unit: 'pc' },
  'aubergine':         { aisle: 'veg', emoji: '🍆', unit: 'pc' },
  'poivron':           { aisle: 'veg', emoji: '🫑', unit: 'pc' },
  'poireau':           { aisle: 'veg', emoji: '🥬', unit: 'pc' },
  'champignon':        { aisle: 'veg', emoji: '🍄', unit: 'g' },
  'champignons de paris': { aisle: 'veg', emoji: '🍄', unit: 'g' },
  'epinards':          { aisle: 'veg', emoji: '🥬', unit: 'g' },
  'brocoli':           { aisle: 'veg', emoji: '🥦', unit: 'pc' },
  'haricots verts':    { aisle: 'veg', emoji: '🫛', unit: 'g' },
  'salade':            { aisle: 'veg', emoji: '🥗', unit: 'pc' },
  'citron':            { aisle: 'veg', emoji: '🍋', unit: 'pc' },
  'citron vert':       { aisle: 'veg', emoji: '🍋', unit: 'pc' },
  'persil':            { aisle: 'veg', emoji: '🌿', unit: 'botte' },
  'coriandre':         { aisle: 'veg', emoji: '🌿', unit: 'botte' },
  'basilic':           { aisle: 'veg', emoji: '🌿', unit: 'botte' },
  'thym':              { aisle: 'veg', emoji: '🌿', unit: 'branche' },
  'menthe':            { aisle: 'veg', emoji: '🌿', unit: 'botte' },
  'gingembre':         { aisle: 'veg', emoji: '🫚', unit: 'g' },
  'olives':            { aisle: 'pantry', emoji: '🫒', unit: 'g' },
  'olives noires':     { aisle: 'pantry', emoji: '🫒', unit: 'g' },
  'cebette':           { aisle: 'veg', emoji: '🌱', unit: 'botte' },
  'celeri':            { aisle: 'veg', emoji: '🌿', unit: 'branche' },
  'potiron':           { aisle: 'veg', emoji: '🎃', unit: 'g' },
  'chataignes cuites': { aisle: 'pantry', emoji: '🌰', unit: 'g' },
  'abricots secs':     { aisle: 'pantry', emoji: '🍑', unit: 'g' },
  'pois chiches':      { aisle: 'pantry', emoji: '🫘', unit: 'g' },
  'haricots rouges':   { aisle: 'pantry', emoji: '🫘', unit: 'g' },
  'lentilles corail':  { aisle: 'pantry', emoji: '🌾', unit: 'g' },
  'germes de soja':    { aisle: 'veg', emoji: '🌱', unit: 'g' },
  'cacahuetes':        { aisle: 'pantry', emoji: '🥜', unit: 'g' },
  'amandes effilees':  { aisle: 'pantry', emoji: '🌰', unit: 'g' },
  'noix de muscade':   { aisle: 'pantry', emoji: '🌰', unit: 'pincée' },

  // Viandes & Charcuterie & Poisson
  'boeuf':             { aisle: 'meat', emoji: '🥩', unit: 'g' },
  'boeuf bourguignon': { aisle: 'meat', emoji: '🥩', unit: 'g' },
  'steak hache':       { aisle: 'meat', emoji: '🥩', unit: 'g' },
  'porc':              { aisle: 'meat', emoji: '🥩', unit: 'g' },
  'sauté de porc':     { aisle: 'meat', emoji: '🥩', unit: 'g' },
  'agneau':            { aisle: 'meat', emoji: '🥩', unit: 'g' },
  'cotes d\'agneau':   { aisle: 'meat', emoji: '🥩', unit: 'pc' },
  'veau':              { aisle: 'meat', emoji: '🥩', unit: 'g' },
  'poulet':            { aisle: 'meat', emoji: '🍗', unit: 'g' },
  'cuisses de poulet': { aisle: 'meat', emoji: '🍗', unit: 'pc' },
  'blanc de poulet':   { aisle: 'meat', emoji: '🍗', unit: 'g' },
  'dinde':             { aisle: 'meat', emoji: '🍗', unit: 'g' },
  'jambon':            { aisle: 'meat', emoji: '🍖', unit: 'tranche' },
  'lardons':           { aisle: 'meat', emoji: '🥓', unit: 'g' },
  'merguez':           { aisle: 'meat', emoji: '🌭', unit: 'pc' },
  'chorizo':           { aisle: 'meat', emoji: '🌭', unit: 'g' },
  'saumon':            { aisle: 'meat', emoji: '🐟', unit: 'g' },
  'cabillaud':         { aisle: 'meat', emoji: '🐟', unit: 'g' },
  'truite':            { aisle: 'meat', emoji: '🐟', unit: 'pc' },
  'crevettes':         { aisle: 'meat', emoji: '🦐', unit: 'g' },
  'moules':            { aisle: 'meat', emoji: '🦪', unit: 'kg' },
  'poisson blanc':     { aisle: 'meat', emoji: '🐟', unit: 'g' },

  // Crémerie & Œufs
  'lait':              { aisle: 'dairy', emoji: '🥛', unit: 'ml' },
  'beurre':            { aisle: 'dairy', emoji: '🧈', unit: 'g' },
  'creme fraiche':     { aisle: 'dairy', emoji: '🥛', unit: 'ml' },
  'creme liquide':     { aisle: 'dairy', emoji: '🥛', unit: 'ml' },
  'oeuf':              { aisle: 'dairy', emoji: '🥚', unit: 'pc' },
  'oeufs':             { aisle: 'dairy', emoji: '🥚', unit: 'pc' },
  'mozzarella':        { aisle: 'dairy', emoji: '🧀', unit: 'g' },
  'parmesan':          { aisle: 'dairy', emoji: '🧀', unit: 'g' },
  'gruyere':           { aisle: 'dairy', emoji: '🧀', unit: 'g' },
  'fromage rape':      { aisle: 'dairy', emoji: '🧀', unit: 'g' },
  'chevre':            { aisle: 'dairy', emoji: '🧀', unit: 'g' },
  'feta':              { aisle: 'dairy', emoji: '🧀', unit: 'g' },
  'ricotta':           { aisle: 'dairy', emoji: '🧀', unit: 'g' },
  'yaourt':            { aisle: 'dairy', emoji: '🥛', unit: 'pc' },
  'tofu':              { aisle: 'dairy', emoji: '🥢', unit: 'g' },

  // Épicerie & Condiments
  'pates':             { aisle: 'pantry', emoji: '🍝', unit: 'g' },
  'spaghetti':         { aisle: 'pantry', emoji: '🍝', unit: 'g' },
  'tagliatelles':      { aisle: 'pantry', emoji: '🍝', unit: 'g' },
  'lasagnes':          { aisle: 'pantry', emoji: '🍝', unit: 'pc' },
  'penne':             { aisle: 'pantry', emoji: '🍝', unit: 'g' },
  'riz':               { aisle: 'pantry', emoji: '🍚', unit: 'g' },
  'riz arborio':       { aisle: 'pantry', emoji: '🍚', unit: 'g' },
  'semoule':           { aisle: 'pantry', emoji: '🌾', unit: 'g' },
  'quinoa':            { aisle: 'pantry', emoji: '🌾', unit: 'g' },
  'farine':            { aisle: 'pantry', emoji: '🌾', unit: 'g' },
  'sarrasin':          { aisle: 'pantry', emoji: '🌾', unit: 'g' },
  'huile d\'olive':    { aisle: 'pantry', emoji: '🫒', unit: 'cs' },
  'huile de sesame':   { aisle: 'pantry', emoji: '🫒', unit: 'cs' },
  'vinaigre':          { aisle: 'pantry', emoji: '🧴', unit: 'cs' },
  'sauce soja':        { aisle: 'pantry', emoji: '🥡', unit: 'cs' },
  'sauce nuoc-mam':    { aisle: 'pantry', emoji: '🥡', unit: 'cs' },
  'sauce tomate':      { aisle: 'pantry', emoji: '🥫', unit: 'g' },
  'pate de curry':     { aisle: 'pantry', emoji: '🌶️', unit: 'cc' },
  'curry':             { aisle: 'pantry', emoji: '🌶️', unit: 'cc' },
  'paprika':           { aisle: 'pantry', emoji: '🌶️', unit: 'cc' },
  'piment':            { aisle: 'pantry', emoji: '🌶️', unit: 'pincée' },
  'cumin':             { aisle: 'pantry', emoji: '🌿', unit: 'cc' },
  'curcuma':           { aisle: 'pantry', emoji: '🌿', unit: 'cc' },
  'safran':            { aisle: 'pantry', emoji: '🌿', unit: 'pincée' },
  'sel':               { aisle: 'pantry', emoji: '🧂', unit: 'pincée' },
  'poivre':            { aisle: 'pantry', emoji: '🧂', unit: 'pincée' },
  'sucre':             { aisle: 'pantry', emoji: '🥄', unit: 'g' },
  'miel':              { aisle: 'pantry', emoji: '🍯', unit: 'cs' },
  'moutarde':          { aisle: 'pantry', emoji: '🟡', unit: 'cs' },
  'lait coco':         { aisle: 'pantry', emoji: '🥥', unit: 'ml' },
  'lait de coco':      { aisle: 'pantry', emoji: '🥥', unit: 'ml' },
  'bouillon de volaille': { aisle: 'pantry', emoji: '🥣', unit: 'ml' },
  'bouillon de boeuf': { aisle: 'pantry', emoji: '🥣', unit: 'ml' },
  'bouillon de legumes': { aisle: 'pantry', emoji: '🥣', unit: 'ml' },
  'fond de veau':      { aisle: 'pantry', emoji: '🥣', unit: 'ml' },
  'vin rouge':         { aisle: 'pantry', emoji: '🍷', unit: 'ml' },
  'vin blanc':         { aisle: 'pantry', emoji: '🍷', unit: 'ml' },
  'pesto':             { aisle: 'pantry', emoji: '🌿', unit: 'g' },
  'pate brisee':       { aisle: 'dairy', emoji: '🥧', unit: 'pc' },
  'pate a pizza':      { aisle: 'dairy', emoji: '🍕', unit: 'pc' },
  'pain':              { aisle: 'pantry', emoji: '🥖', unit: 'pc' },
  'feuilles de brick': { aisle: 'dairy', emoji: '🥟', unit: 'pc' },
  'nouilles de riz':   { aisle: 'pantry', emoji: '🍜', unit: 'g' },

  // Surgelés
  'petits pois':       { aisle: 'frozen', emoji: '🟢', unit: 'g' },
  'epinards surgeles': { aisle: 'frozen', emoji: '🥬', unit: 'g' },
  'frites surgelees':  { aisle: 'frozen', emoji: '🍟', unit: 'g' },
  'pizza surgelee':    { aisle: 'frozen', emoji: '🍕', unit: 'pc' },
  'glace':             { aisle: 'frozen', emoji: '🍨', unit: 'ml' },
  'sorbet':            { aisle: 'frozen', emoji: '🍧', unit: 'ml' },

  // Fruits
  'raisin':            { aisle: 'veg', emoji: '🍇', unit: 'g' },
  'raisins':           { aisle: 'veg', emoji: '🍇', unit: 'g' },
  'raisins secs':      { aisle: 'pantry', emoji: '🍇', unit: 'g' },
  'banane':            { aisle: 'veg', emoji: '🍌', unit: 'pc' },
  'pomme':             { aisle: 'veg', emoji: '🍎', unit: 'pc' },
  'poire':             { aisle: 'veg', emoji: '🍐', unit: 'pc' },
  'fraise':            { aisle: 'veg', emoji: '🍓', unit: 'g' },
  'fraises':           { aisle: 'veg', emoji: '🍓', unit: 'g' },
  'framboise':         { aisle: 'veg', emoji: '🫐', unit: 'g' },
  'framboises':        { aisle: 'veg', emoji: '🫐', unit: 'g' },
  'myrtille':          { aisle: 'veg', emoji: '🫐', unit: 'g' },
  'myrtilles':         { aisle: 'veg', emoji: '🫐', unit: 'g' },
  'mure':              { aisle: 'veg', emoji: '🫐', unit: 'g' },
  'mures':             { aisle: 'veg', emoji: '🫐', unit: 'g' },
  'cerise':            { aisle: 'veg', emoji: '🍒', unit: 'g' },
  'cerises':           { aisle: 'veg', emoji: '🍒', unit: 'g' },
  'kiwi':              { aisle: 'veg', emoji: '🥝', unit: 'pc' },
  'mangue':            { aisle: 'veg', emoji: '🥭', unit: 'pc' },
  'ananas':            { aisle: 'veg', emoji: '🍍', unit: 'pc' },
  'peche':             { aisle: 'veg', emoji: '🍑', unit: 'pc' },
  'abricot':           { aisle: 'veg', emoji: '🍑', unit: 'pc' },
  'prune':             { aisle: 'veg', emoji: '🍑', unit: 'pc' },
  'melon':             { aisle: 'veg', emoji: '🍈', unit: 'pc' },
  'pasteque':          { aisle: 'veg', emoji: '🍉', unit: 'pc' },
  'orange':            { aisle: 'veg', emoji: '🍊', unit: 'pc' },
  'mandarine':         { aisle: 'veg', emoji: '🍊', unit: 'pc' },
  'clementine':        { aisle: 'veg', emoji: '🍊', unit: 'pc' },
  'pamplemousse':      { aisle: 'veg', emoji: '🍊', unit: 'pc' },
  'figue':             { aisle: 'veg', emoji: '🍑', unit: 'pc' },
  'datte':             { aisle: 'pantry', emoji: '🌴', unit: 'g' },
  'avocat':            { aisle: 'veg', emoji: '🥑', unit: 'pc' },

  // Légumes additionnels
  'chou':              { aisle: 'veg', emoji: '🥬', unit: 'pc' },
  'chou-fleur':        { aisle: 'veg', emoji: '🥦', unit: 'pc' },
  'chou rouge':        { aisle: 'veg', emoji: '🥬', unit: 'pc' },
  'choux de bruxelles':{ aisle: 'veg', emoji: '🥬', unit: 'g' },
  'fenouil':           { aisle: 'veg', emoji: '🌿', unit: 'pc' },
  'asperge':           { aisle: 'veg', emoji: '🌿', unit: 'g' },
  'asperges':          { aisle: 'veg', emoji: '🌿', unit: 'g' },
  'betterave':         { aisle: 'veg', emoji: '🌱', unit: 'pc' },
  'radis':             { aisle: 'veg', emoji: '🌶️', unit: 'g' },
  'navet':             { aisle: 'veg', emoji: '🥔', unit: 'pc' },
  'panais':            { aisle: 'veg', emoji: '🥕', unit: 'pc' },
  'mais':              { aisle: 'veg', emoji: '🌽', unit: 'g' },
  'artichaut':         { aisle: 'veg', emoji: '🌿', unit: 'pc' },
  'endive':            { aisle: 'veg', emoji: '🥬', unit: 'pc' },
  'endives':           { aisle: 'veg', emoji: '🥬', unit: 'pc' },
  'concombre':         { aisle: 'veg', emoji: '🥒', unit: 'pc' },
  'butternut':         { aisle: 'veg', emoji: '🎃', unit: 'pc' },
  'courge':            { aisle: 'veg', emoji: '🎃', unit: 'pc' },
  'patate douce':      { aisle: 'veg', emoji: '🍠', unit: 'pc' },
  'blette':            { aisle: 'veg', emoji: '🥬', unit: 'g' },
  'blettes':           { aisle: 'veg', emoji: '🥬', unit: 'g' },
  'roquette':          { aisle: 'veg', emoji: '🥗', unit: 'g' },
  'mache':             { aisle: 'veg', emoji: '🥗', unit: 'g' },
  'noix':              { aisle: 'pantry', emoji: '🌰', unit: 'g' },
  'noisettes':         { aisle: 'pantry', emoji: '🌰', unit: 'g' },
  'pignons':           { aisle: 'pantry', emoji: '🌰', unit: 'g' },
  'amandes':           { aisle: 'pantry', emoji: '🌰', unit: 'g' },

  // Crémerie additionnel
  'emmental':          { aisle: 'dairy', emoji: '🧀', unit: 'g' },
  'comte':             { aisle: 'dairy', emoji: '🧀', unit: 'g' },
  'cheddar':           { aisle: 'dairy', emoji: '🧀', unit: 'g' },
  'brie':              { aisle: 'dairy', emoji: '🧀', unit: 'g' },
  'camembert':         { aisle: 'dairy', emoji: '🧀', unit: 'pc' },
  'mascarpone':        { aisle: 'dairy', emoji: '🧀', unit: 'g' },
  'fromage blanc':     { aisle: 'dairy', emoji: '🥛', unit: 'g' },
  'fromage':           { aisle: 'dairy', emoji: '🧀', unit: 'g' },
  'lait demi-ecreme':  { aisle: 'dairy', emoji: '🥛', unit: 'ml' },
  'lait entier':       { aisle: 'dairy', emoji: '🥛', unit: 'ml' },
  'lait ecreme':       { aisle: 'dairy', emoji: '🥛', unit: 'ml' },
  'lait d\'avoine':    { aisle: 'dairy', emoji: '🥛', unit: 'ml' },
  'lait d\'amande':    { aisle: 'dairy', emoji: '🥛', unit: 'ml' },
  'lait de soja':      { aisle: 'dairy', emoji: '🥛', unit: 'ml' },
  'beurre demi-sel':   { aisle: 'dairy', emoji: '🧈', unit: 'g' },

  // Viandes additionnel
  'canard':            { aisle: 'meat', emoji: '🦆', unit: 'g' },
  'magret':            { aisle: 'meat', emoji: '🦆', unit: 'pc' },
  'pintade':           { aisle: 'meat', emoji: '🍗', unit: 'pc' },
  'lapin':             { aisle: 'meat', emoji: '🥩', unit: 'g' },
  'saucisse':          { aisle: 'meat', emoji: '🌭', unit: 'pc' },
  'saucisses':         { aisle: 'meat', emoji: '🌭', unit: 'pc' },
  'saucisson':         { aisle: 'meat', emoji: '🌭', unit: 'g' },
  'pate':              { aisle: 'meat', emoji: '🥫', unit: 'g' },
  'rillettes':         { aisle: 'meat', emoji: '🥫', unit: 'g' },
  'thon':              { aisle: 'meat', emoji: '🐟', unit: 'g' },
  'sardines':          { aisle: 'meat', emoji: '🐟', unit: 'g' },
  'anchois':           { aisle: 'meat', emoji: '🐟', unit: 'g' },
  'maquereau':         { aisle: 'meat', emoji: '🐟', unit: 'pc' },
  'dorade':            { aisle: 'meat', emoji: '🐟', unit: 'pc' },
  'bar':               { aisle: 'meat', emoji: '🐟', unit: 'pc' },
  'sole':              { aisle: 'meat', emoji: '🐟', unit: 'pc' },
  'lieu noir':         { aisle: 'meat', emoji: '🐟', unit: 'g' },
  'saint-jacques':     { aisle: 'meat', emoji: '🐚', unit: 'pc' },
  'calmars':           { aisle: 'meat', emoji: '🦑', unit: 'g' },

  // Épicerie additionnel
  'huile':             { aisle: 'pantry', emoji: '🫒', unit: 'cs' },
  'huile vegetale':    { aisle: 'pantry', emoji: '🫒', unit: 'cs' },
  'huile de tournesol':{ aisle: 'pantry', emoji: '🫒', unit: 'cs' },
  'huile de colza':    { aisle: 'pantry', emoji: '🫒', unit: 'cs' },
  'vinaigre balsamique': { aisle: 'pantry', emoji: '🧴', unit: 'cs' },
  'vinaigre de cidre': { aisle: 'pantry', emoji: '🧴', unit: 'cs' },
  'vinaigre de vin':   { aisle: 'pantry', emoji: '🧴', unit: 'cs' },
  'fleur de sel':      { aisle: 'pantry', emoji: '🧂', unit: 'pincée' },
  'gros sel':          { aisle: 'pantry', emoji: '🧂', unit: 'g' },
  'sucre roux':        { aisle: 'pantry', emoji: '🥄', unit: 'g' },
  'sucre vanille':     { aisle: 'pantry', emoji: '🥄', unit: 'g' },
  'vanille':           { aisle: 'pantry', emoji: '🌿', unit: 'pc' },
  'cannelle':          { aisle: 'pantry', emoji: '🌿', unit: 'cc' },
  'cardamome':         { aisle: 'pantry', emoji: '🌿', unit: 'cc' },
  'clous de girofle':  { aisle: 'pantry', emoji: '🌿', unit: 'pc' },
  'noix de muscade':   { aisle: 'pantry', emoji: '🌰', unit: 'pincée' },
  'origan':            { aisle: 'pantry', emoji: '🌿', unit: 'cc' },
  'romarin':           { aisle: 'pantry', emoji: '🌿', unit: 'branche' },
  'laurier':           { aisle: 'pantry', emoji: '🌿', unit: 'pc' },
  'levure':            { aisle: 'pantry', emoji: '🍞', unit: 'g' },
  'levure chimique':   { aisle: 'pantry', emoji: '🍞', unit: 'g' },
  'bicarbonate':       { aisle: 'pantry', emoji: '🥄', unit: 'cc' },
  'maizena':           { aisle: 'pantry', emoji: '🌾', unit: 'g' },
  'fecule':            { aisle: 'pantry', emoji: '🌾', unit: 'g' },
  'cacao':             { aisle: 'pantry', emoji: '🍫', unit: 'g' },
  'chocolat':          { aisle: 'pantry', emoji: '🍫', unit: 'g' },
  'chocolat noir':     { aisle: 'pantry', emoji: '🍫', unit: 'g' },
  'pate a tartiner':   { aisle: 'pantry', emoji: '🍫', unit: 'g' },
  'confiture':         { aisle: 'pantry', emoji: '🍓', unit: 'g' },
  'sirop d\'erable':   { aisle: 'pantry', emoji: '🍯', unit: 'cs' },
  'cafe':              { aisle: 'pantry', emoji: '☕', unit: 'g' },
  'the':               { aisle: 'pantry', emoji: '🍵', unit: 'g' },
  'harissa':           { aisle: 'pantry', emoji: '🌶️', unit: 'cc' },
  'sriracha':          { aisle: 'pantry', emoji: '🌶️', unit: 'cc' },
  'ketchup':           { aisle: 'pantry', emoji: '🥫', unit: 'cs' },
  'mayonnaise':        { aisle: 'pantry', emoji: '🟡', unit: 'cs' },
  'tabasco':           { aisle: 'pantry', emoji: '🌶️', unit: 'pincée' },
  'capres':            { aisle: 'pantry', emoji: '🟢', unit: 'g' },
  'cornichons':        { aisle: 'pantry', emoji: '🥒', unit: 'g' },
  'biere':             { aisle: 'pantry', emoji: '🍺', unit: 'ml' },
  'cidre':             { aisle: 'pantry', emoji: '🍎', unit: 'ml' },
};

// Synonymes ramenés à la clé canonique
const SYNONYMS = {
  'oignons': 'oignon',
  'echalotes': 'echalote',
  'gousses d\'ail': 'gousse d\'ail',
  'carottes': 'carotte',
  'pommes de terre': 'pomme de terre',
  'tomates': 'tomate',
  'courgettes': 'courgette',
  'aubergines': 'aubergine',
  'poivrons': 'poivron',
  'poireaux': 'poireau',
  'champignons': 'champignon',
  'pommes': 'pomme',
  'poires': 'poire',
  'bananes': 'banane',
  'oranges': 'orange',
  'oeuf': 'oeufs',
  'creme': 'creme fraiche',
  'creme epaisse': 'creme fraiche',
  'lait coco': 'lait de coco',
  'pate de curry rouge': 'pate de curry',
  'pate de curry vert': 'pate de curry',
  'gousse ail': 'ail',
  'sel fin': 'sel',
  'poivre noir': 'poivre',
  'poivre du moulin': 'poivre',
  'huile olive': 'huile d\'olive',
};

// Normalise un nom: minuscules, accents enlevés, pluriels simples
export function normalizeIngredient(name) {
  let n = (name || '').toLowerCase().trim();
  n = n.normalize('NFD').replace(/[̀-ͯ]/g, '');
  n = n.replace(/œ/g, 'oe').replace(/æ/g, 'ae');
  n = n.replace(/\s+/g, ' ');
  if (SYNONYMS[n]) n = SYNONYMS[n];
  return n;
}

export function aisleFor(name) {
  const n = normalizeIngredient(name);
  if (INGREDIENT_DB[n]) return INGREDIENT_DB[n].aisle;
  // heuristiques fallback (ordre = priorité)
  if (/\b(surgele|congele|glace|sorbet)\b/.test(n)) return 'frozen';
  if (/poisson|saumon|cabillaud|truite|thon|bar\b|dorade|lieu|sole|raie|lotte|crevette|moule|seiche|calmar|encornet|crabe|langoustine|st-jacques|saint-jacques|sardine|anchois|maquereau|hareng/.test(n)) return 'meat';
  if (/poulet|dinde|canard|pintade|caille|magret|volaille|escalope|filet de poulet/.test(n)) return 'meat';
  if (/boeuf|bœuf|veau|porc|agneau|jambon|lardon|merguez|chorizo|saucisse|saucisson|rillette|terrine|pate de campagne|bacon|viande|mouton|gibier|lapin/.test(n)) return 'meat';
  if (/\b(lait|fromage|yaourt|beurre|creme|oeuf|mozzarella|parmesan|gruyere|emmental|comte|chevre|feta|ricotta|brie|camembert|cheddar|mascarpone|faisselle)\b/.test(n)) return 'dairy';
  if (/\b(epice|sel|poivre|sucre|farine|huile|vinaigre|sauce|bouillon|riz|pates|pate de|spaghetti|tagliatelle|penne|nouille|conserve|vin|biere|cidre|pesto|moutarde|miel|cafe|the|cacao|chocolat|confiture|levure|bicarbonate|maizena|fecule|origan|romarin|laurier|cannelle|vanille|ketchup|mayonnaise|tabasco|harissa|sriracha|capres|cornichon|olive|raisins secs)\b/.test(n)) return 'pantry';
  // fruits / légumes / herbes
  if (/\b(legume|fruit|herbe|salade|carotte|tomate|courgette|aubergine|poivron|poireau|champignon|epinard|brocoli|haricot|citron|persil|basilic|coriandre|menthe|gingembre|oignon|ail|echalote|potiron|courge|butternut|patate|chou|fenouil|asperge|betterave|radis|navet|panais|mais|artichaut|endive|avocat|concombre|blette|roquette|mache|cebette|raisin|banane|pomme|poire|fraise|framboise|myrtille|mure|cerise|kiwi|mangue|ananas|peche|abricot|prune|melon|pasteque|orange|mandarine|clementine|pamplemousse|figue|datte|noix|noisette|pignon|amande)\b/.test(n)) return 'veg';
  return 'misc';
}

export function aisleEmojiOf(aisleId) {
  const a = AISLES.find(x => x.id === aisleId);
  return a?.emoji || '🛒';
}

export function emojiFor(name) {
  const n = normalizeIngredient(name);
  if (INGREDIENT_DB[n]) return INGREDIENT_DB[n].emoji;
  // fallback: emoji du rayon trouvé par heuristique (ne donne plus 🛒 sauf pour Divers)
  return aisleEmojiOf(aisleFor(name));
}

export function defaultUnitFor(name) {
  const n = normalizeIngredient(name);
  if (INGREDIENT_DB[n]) return INGREDIENT_DB[n].unit;
  return 'g';
}

// === RECETTES SEED ===
// Format compact: { id, name, cat, time, portions, ingredients: [[qty, unit, name], ...], steps: [...] }

const r = (id, name, cat, time, portions, ingredients, steps) => ({
  id, name, cat, time, portions,
  ingredients: ingredients.map(([qty, unit, n]) => ({ qty, unit, name: n })),
  steps,
});

// Infère une catégorie simple à partir du nom et des ingrédients
export function inferCategory(name, ingredients = []) {
  const src = (name + ' ' + (Array.isArray(ingredients) ? ingredients.map(i => i.name || '').join(' ') : '')).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const map = [
    { id: 'volaille', keys: ['poulet', 'dinde', 'cuisses', 'blanc de poulet'] },
    { id: 'poisson',  keys: ['saumon', 'cabillaud', 'truite', 'crevet', 'poisson', 'thon'] },
    { id: 'viande',   keys: ['boeuf', 'boeuf', 'porc', 'agneau', 'steak', 'hach', 'jambon', 'lardon', 'merguez', 'hamburger'] },
    { id: 'vege',     keys: ['tofu', 'lentil', 'pois chiche', 'quinoa', 'salade', 'courgett', 'aubergin', 'brocoli', 'epinard'] },
    { id: 'mijote',   keys: ['tajine', 'mijot', 'bourguignon', 'blanquette', 'tajine'] },
    { id: 'monde',    keys: ['pad thai', 'pad-thai', 'paella', 'couscous', 'chili', 'mexic', 'thai', 'curry'] },
    { id: 'four',     keys: ['lasagne', 'quiche', 'gratin', 'tarte', 'pizza', 'four'] },
    { id: 'rapide',   keys: ['omelette', 'wrap', 'sandwich', 'croque', 'pancake', 'wok', 'carbonara', 'pate', 'pâtes', 'pates'] },
    { id: 'sauce',    keys: ['sauce', 'bolognaise', 'basquaise', 'tomate'] },
    { id: 'eco',      keys: ['riz', 'lentil', 'dahl', 'econom'] },
  ];

  for (const entry of map) {
    for (const k of entry.keys) if (src.includes(k)) return entry.id;
  }
  return 'autres';
}

export const SEED_RECIPES = [
  // === VIANDE ===
  r('boeuf-haricots-pdt', 'Bœuf haricots verts pommes de terre', 'viande', 30, 4, [
    [600, 'g', 'Bœuf'], [400, 'g', 'Haricots verts'], [600, 'g', 'Pomme de terre'],
    [1, 'pc', 'Oignon'], [2, 'gousse', 'Ail'], [2, 'cs', 'Huile d\'olive'],
    [1, 'pincée', 'Sel'], [1, 'pincée', 'Poivre'],
  ], [
    'Éplucher et couper les pommes de terre, les cuire 15 minutes à l\'eau salée.',
    'Faire revenir l\'oignon émincé et l\'ail dans l\'huile.',
    'Ajouter le bœuf en morceaux, saisir 5 minutes.',
    'Ajouter les haricots verts et les pommes de terre, mélanger 10 minutes.',
    'Saler, poivrer, servir bien chaud.',
  ]),
  r('saute-porc-moutarde', 'Sauté de porc à la moutarde', 'viande', 35, 4, [
    [700, 'g', 'Sauté de porc'], [1, 'pc', 'Oignon'], [200, 'ml', 'Crème fraîche'],
    [3, 'cs', 'Moutarde'], [150, 'ml', 'Vin blanc'], [1, 'cs', 'Huile d\'olive'],
    [1, 'pincée', 'Sel'], [1, 'pincée', 'Poivre'],
  ], [
    'Faire dorer le porc dans l\'huile sur feu vif.',
    'Ajouter l\'oignon émincé, faire suer 3 minutes.',
    'Déglacer au vin blanc, gratter le fond.',
    'Ajouter crème et moutarde, mélanger.',
    'Couvrir, mijoter 20 minutes à feu doux. Saler, poivrer.',
  ]),
  r('steak-poivre', 'Steak haché sauce poivre', 'viande', 20, 4, [
    [4, 'pc', 'Steak haché'], [200, 'ml', 'Crème liquide'], [2, 'cs', 'Poivre'],
    [50, 'ml', 'Vin blanc'], [20, 'g', 'Beurre'], [1, 'pincée', 'Sel'],
  ], [
    'Cuire les steaks dans le beurre, 3 min de chaque côté. Réserver.',
    'Déglacer la poêle au vin blanc.',
    'Ajouter la crème et le poivre concassé. Réduire 5 minutes.',
    'Saler, napper les steaks de sauce.',
  ]),
  r('cotes-agneau-ratatouille', 'Côtes d\'agneau et ratatouille', 'viande', 50, 4, [
    [8, 'pc', 'Côtes d\'agneau'], [2, 'pc', 'Courgette'], [1, 'pc', 'Aubergine'],
    [2, 'pc', 'Poivron'], [3, 'pc', 'Tomate'], [1, 'pc', 'Oignon'],
    [3, 'gousse', 'Ail'], [3, 'cs', 'Huile d\'olive'], [2, 'branche', 'Thym'],
    [1, 'pincée', 'Sel'], [1, 'pincée', 'Poivre'],
  ], [
    'Couper tous les légumes en dés.',
    'Faire revenir oignon et ail, ajouter les autres légumes par étapes.',
    'Ajouter le thym, mijoter 30 minutes à couvert.',
    'Pendant ce temps, griller les côtes 3 min par face.',
    'Saler, poivrer, dresser les côtes sur la ratatouille.',
  ]),

  // === VOLAILLE ===
  r('poulet-roti-legumes', 'Poulet rôti aux légumes du four', 'volaille', 80, 4, [
    [1, 'pc', 'Poulet'], [600, 'g', 'Pomme de terre'], [3, 'pc', 'Carotte'],
    [1, 'pc', 'Oignon'], [4, 'gousse', 'Ail'], [3, 'cs', 'Huile d\'olive'],
    [3, 'branche', 'Thym'], [1, 'pincée', 'Sel'], [1, 'pincée', 'Poivre'],
  ], [
    'Préchauffer le four à 200 °C.',
    'Couper les légumes en gros morceaux, disposer dans un plat.',
    'Arroser d\'huile, ajouter ail et thym. Saler, poivrer.',
    'Poser le poulet sur les légumes, badigeonner d\'huile.',
    'Enfourner 1 h 10, arroser à mi-cuisson.',
  ]),
  r('curry-poulet-coco', 'Curry de poulet au lait de coco', 'volaille', 35, 4, [
    [600, 'g', 'Blanc de poulet'], [400, 'ml', 'Lait de coco'], [2, 'cs', 'Pâte de curry'],
    [1, 'pc', 'Oignon'], [2, 'gousse', 'Ail'], [1, 'pc', 'Poivron'],
    [200, 'g', 'Riz'], [1, 'cs', 'Huile d\'olive'], [1, 'botte', 'Coriandre'],
  ], [
    'Cuire le riz selon les instructions du paquet.',
    'Faire revenir oignon et ail dans l\'huile.',
    'Ajouter le poulet en cubes, dorer 5 minutes.',
    'Ajouter pâte de curry et poivron, mélanger 1 minute.',
    'Verser le lait de coco, mijoter 15 minutes.',
    'Servir avec le riz, parsemer de coriandre.',
  ]),
  r('emince-dinde-paprika', 'Émincé de dinde au paprika', 'volaille', 25, 4, [
    [600, 'g', 'Dinde'], [200, 'ml', 'Crème fraîche'], [2, 'cc', 'Paprika'],
    [1, 'pc', 'Oignon'], [1, 'pc', 'Poivron'], [1, 'cs', 'Huile d\'olive'],
    [1, 'pincée', 'Sel'], [1, 'pincée', 'Poivre'],
  ], [
    'Émincer la dinde, l\'oignon et le poivron.',
    'Faire dorer la dinde dans l\'huile, réserver.',
    'Faire revenir oignon et poivron 5 minutes.',
    'Remettre la dinde, ajouter paprika et crème.',
    'Mijoter 8 minutes. Saler, poivrer.',
  ]),
  r('cuisses-poulet-citron-olives', 'Cuisses de poulet citron olives', 'volaille', 50, 4, [
    [4, 'pc', 'Cuisses de poulet'], [2, 'pc', 'Citron'], [150, 'g', 'Olives'],
    [1, 'pc', 'Oignon'], [3, 'gousse', 'Ail'], [200, 'ml', 'Bouillon de volaille'],
    [2, 'cs', 'Huile d\'olive'], [2, 'branche', 'Thym'],
  ], [
    'Faire dorer les cuisses dans l\'huile sur toutes les faces.',
    'Ajouter oignon et ail émincés.',
    'Verser le bouillon, ajouter citron en quartiers, olives et thym.',
    'Couvrir, mijoter 35 minutes.',
  ]),

  // === POISSON ===
  r('mijote-poisson-coco', 'Mijoté de poisson curry et lait de coco', 'poisson', 40, 4, [
    [600, 'g', 'Cabillaud'], [400, 'ml', 'Lait de coco'], [2, 'cs', 'Pâte de curry'],
    [1, 'pc', 'Échalote'], [1, 'pc', 'Oignon'], [600, 'g', 'Pomme de terre'],
    [4, 'pc', 'Bœuf'], [200, 'ml', 'Lait de coco'], [1, 'botte', 'Coriandre'],
  ], [
    'Éplucher et couper les pommes de terre, les cuire 12 minutes à l\'eau.',
    'Faire suer oignon et échalote dans une cocotte.',
    'Ajouter pâte de curry, mélanger 1 minute.',
    'Verser le lait de coco, ajouter les pommes de terre.',
    'Déposer le poisson en morceaux, mijoter 8 minutes à couvert.',
    'Parsemer de coriandre fraîche.',
  ]),
  r('saumon-brocolis', 'Saumon grillé aux brocolis vapeur', 'poisson', 25, 4, [
    [4, 'pc', 'Saumon'], [1, 'pc', 'Brocoli'], [1, 'pc', 'Citron'],
    [2, 'cs', 'Huile d\'olive'], [1, 'pincée', 'Sel'], [1, 'pincée', 'Poivre'],
  ], [
    'Détailler le brocoli en bouquets, cuire 8 minutes à la vapeur.',
    'Saler et poivrer les pavés de saumon.',
    'Cuire les pavés à la poêle 4 minutes côté peau, 2 minutes l\'autre face.',
    'Servir avec brocoli, citron et un filet d\'huile.',
  ]),
  r('cabillaud-sauce-vierge', 'Cabillaud sauce vierge', 'poisson', 25, 4, [
    [600, 'g', 'Cabillaud'], [3, 'pc', 'Tomate'], [1, 'pc', 'Citron'],
    [4, 'cs', 'Huile d\'olive'], [1, 'botte', 'Basilic'], [2, 'gousse', 'Ail'],
    [1, 'pincée', 'Sel'], [1, 'pincée', 'Poivre'],
  ], [
    'Tailler les tomates en dés, ciseler le basilic, presser le citron.',
    'Mélanger tomates, basilic, ail haché, jus de citron et huile.',
    'Cuire le cabillaud 4 minutes à la poêle de chaque côté.',
    'Napper le poisson de sauce vierge.',
  ]),
  r('truite-amandes', 'Filets de truite aux amandes', 'poisson', 20, 4, [
    [4, 'pc', 'Truite'], [80, 'g', 'Amandes effilées'], [50, 'g', 'Beurre'],
    [1, 'pc', 'Citron'], [1, 'pincée', 'Sel'], [1, 'pincée', 'Poivre'],
  ], [
    'Saler et poivrer les filets, fariner légèrement.',
    'Faire fondre le beurre, cuire les filets 3 minutes par face.',
    'Réserver. Faire dorer les amandes dans le même beurre.',
    'Arroser les filets de beurre aux amandes et citron.',
  ]),

  // === VÉGÉTARIEN ===
  r('risotto-champignons', 'Risotto aux champignons', 'vege', 35, 4, [
    [300, 'g', 'Riz arborio'], [400, 'g', 'Champignons de paris'], [1, 'pc', 'Oignon'],
    [100, 'ml', 'Vin blanc'], [1, 'l', 'Bouillon de légumes'], [80, 'g', 'Parmesan'],
    [40, 'g', 'Beurre'], [2, 'cs', 'Huile d\'olive'],
  ], [
    'Faire revenir l\'oignon émincé dans l\'huile.',
    'Ajouter le riz, nacrer 2 minutes.',
    'Déglacer au vin blanc.',
    'Ajouter le bouillon louche par louche, en remuant.',
    'À mi-cuisson, ajouter les champignons sautés à part.',
    'En fin de cuisson, ajouter beurre et parmesan.',
  ]),
  r('curry-pois-chiches', 'Curry de pois chiches aux épinards', 'vege', 25, 4, [
    [400, 'g', 'Pois chiches'], [300, 'g', 'Épinards'], [400, 'ml', 'Lait de coco'],
    [1, 'pc', 'Oignon'], [2, 'gousse', 'Ail'], [2, 'cc', 'Curry'],
    [1, 'cc', 'Cumin'], [200, 'g', 'Riz'], [1, 'cs', 'Huile d\'olive'],
  ], [
    'Cuire le riz selon le paquet.',
    'Faire revenir oignon et ail. Ajouter curry et cumin, 1 minute.',
    'Verser le lait de coco et les pois chiches égouttés.',
    'Mijoter 10 minutes. Ajouter les épinards en fin de cuisson.',
    'Servir avec le riz.',
  ]),
  r('gratin-courgettes-chevre', 'Gratin de courgettes au chèvre', 'vege', 45, 4, [
    [4, 'pc', 'Courgette'], [200, 'g', 'Chèvre'], [200, 'ml', 'Crème fraîche'],
    [3, 'pc', 'Œufs'], [50, 'g', 'Parmesan'], [2, 'cs', 'Huile d\'olive'],
    [1, 'pincée', 'Sel'], [1, 'pincée', 'Poivre'],
  ], [
    'Préchauffer le four à 180 °C.',
    'Couper les courgettes en rondelles, faire revenir 8 minutes.',
    'Battre œufs et crème, saler, poivrer.',
    'Disposer courgettes et chèvre émietté dans un plat.',
    'Verser l\'appareil, parsemer de parmesan.',
    'Cuire 30 minutes au four.',
  ]),
  r('buddha-bowl-quinoa', 'Buddha bowl au quinoa', 'vege', 30, 4, [
    [200, 'g', 'Quinoa'], [400, 'g', 'Pois chiches'], [3, 'pc', 'Carotte'],
    [1, 'pc', 'Brocoli'], [200, 'g', 'Feta'], [3, 'cs', 'Huile d\'olive'],
    [1, 'pc', 'Citron'], [1, 'cs', 'Sauce soja'],
  ], [
    'Cuire le quinoa 12 minutes à l\'eau salée.',
    'Cuire le brocoli vapeur 8 minutes.',
    'Râper les carottes, rôtir les pois chiches à la poêle 5 minutes.',
    'Préparer la sauce: huile, citron, soja.',
    'Composer les bols, ajouter feta émiettée et sauce.',
  ]),

  // === MIJOTÉS ===
  r('bourguignon', 'Bœuf bourguignon', 'mijote', 180, 4, [
    [800, 'g', 'Bœuf bourguignon'], [200, 'g', 'Lardons'], [400, 'g', 'Champignons de paris'],
    [4, 'pc', 'Carotte'], [2, 'pc', 'Oignon'], [3, 'gousse', 'Ail'],
    [500, 'ml', 'Vin rouge'], [200, 'ml', 'Bouillon de bœuf'],
    [2, 'cs', 'Farine'], [3, 'branche', 'Thym'],
  ], [
    'Faire dorer les lardons, réserver. Faire dorer le bœuf en plusieurs fois.',
    'Ajouter oignons et carottes en morceaux, faire suer.',
    'Saupoudrer de farine, mélanger 2 minutes.',
    'Verser vin et bouillon, ajouter ail, thym et lardons.',
    'Couvrir, mijoter 2 h 30 à feu très doux.',
    'Ajouter les champignons sautés 15 minutes avant la fin.',
  ]),
  r('blanquette-veau', 'Blanquette de veau', 'mijote', 120, 4, [
    [800, 'g', 'Veau'], [3, 'pc', 'Carotte'], [1, 'pc', 'Poireau'],
    [1, 'pc', 'Oignon'], [300, 'g', 'Champignons de paris'], [200, 'ml', 'Crème fraîche'],
    [2, 'pc', 'Œufs'], [50, 'g', 'Beurre'], [40, 'g', 'Farine'], [1, 'pc', 'Citron'],
  ], [
    'Couvrir le veau d\'eau froide, porter à ébullition, écumer.',
    'Ajouter carottes, poireau, oignon. Mijoter 1 h 15.',
    'Égoutter en gardant le bouillon. Faire un roux beurre + farine.',
    'Détendre avec le bouillon, cuire 5 minutes.',
    'Hors du feu, ajouter crème, jaunes d\'œufs et citron.',
    'Remettre la viande et les champignons sautés. Réchauffer doucement.',
  ]),
  r('tajine-poulet-abricots', 'Tajine de poulet aux abricots', 'mijote', 70, 4, [
    [4, 'pc', 'Cuisses de poulet'], [200, 'g', 'Abricots secs'], [1, 'pc', 'Oignon'],
    [3, 'gousse', 'Ail'], [1, 'pc', 'Gingembre'], [1, 'cc', 'Cumin'],
    [1, 'cc', 'Curcuma'], [1, 'pincée', 'Safran'], [400, 'ml', 'Bouillon de volaille'],
    [200, 'g', 'Semoule'], [2, 'cs', 'Huile d\'olive'],
  ], [
    'Faire dorer les cuisses dans l\'huile.',
    'Ajouter oignon, ail et gingembre. Faire suer.',
    'Ajouter les épices, mélanger 1 minute.',
    'Verser le bouillon, ajouter les abricots.',
    'Couvrir, mijoter 50 minutes.',
    'Préparer la semoule, servir avec le tajine.',
  ]),

  // === RAPIDES ===
  r('pates-carbonara', 'Pâtes carbonara', 'rapide', 20, 4, [
    [400, 'g', 'Spaghetti'], [200, 'g', 'Lardons'], [4, 'pc', 'Œufs'],
    [80, 'g', 'Parmesan'], [1, 'pincée', 'Poivre'],
  ], [
    'Cuire les pâtes al dente.',
    'Faire dorer les lardons à sec.',
    'Battre œufs, parmesan et poivre dans un bol.',
    'Égoutter les pâtes, mélanger aux lardons hors du feu.',
    'Ajouter le mélange aux œufs, remuer vivement.',
  ]),
  r('omelette-herbes', 'Omelette aux herbes', 'rapide', 15, 4, [
    [8, 'pc', 'Œufs'], [1, 'botte', 'Persil'], [1, 'botte', 'Basilic'],
    [30, 'g', 'Beurre'], [50, 'ml', 'Lait'], [1, 'pincée', 'Sel'], [1, 'pincée', 'Poivre'],
  ], [
    'Battre les œufs avec le lait, sel et poivre.',
    'Ciseler les herbes, ajouter aux œufs.',
    'Faire fondre le beurre dans une poêle.',
    'Verser, cuire à feu doux, plier en deux quand le dessus est encore baveux.',
  ]),
  r('wok-tofu', 'Wok de légumes au tofu', 'rapide', 25, 4, [
    [400, 'g', 'Tofu'], [2, 'pc', 'Carotte'], [1, 'pc', 'Brocoli'],
    [1, 'pc', 'Poivron'], [200, 'g', 'Germes de soja'], [3, 'cs', 'Sauce soja'],
    [1, 'cs', 'Huile de sésame'], [2, 'gousse', 'Ail'], [1, 'pc', 'Gingembre'],
  ], [
    'Couper le tofu en cubes, le faire dorer dans l\'huile.',
    'Détailler les légumes en lamelles.',
    'Faire revenir ail et gingembre 30 secondes.',
    'Ajouter les légumes, sauter à feu vif 5 minutes.',
    'Ajouter tofu et sauce soja, mélanger 2 minutes.',
  ]),

  // === ÉCONOMIQUES ===
  r('hachis-parmentier', 'Hachis parmentier', 'eco', 60, 4, [
    [800, 'g', 'Pomme de terre'], [600, 'g', 'Steak haché'], [1, 'pc', 'Oignon'],
    [2, 'gousse', 'Ail'], [200, 'ml', 'Lait'], [50, 'g', 'Beurre'],
    [80, 'g', 'Fromage râpé'], [1, 'pincée', 'Sel'], [1, 'pincée', 'Poivre'],
  ], [
    'Cuire les pommes de terre 20 minutes à l\'eau, les écraser avec lait et beurre.',
    'Faire revenir oignon et ail, ajouter le bœuf, cuire 8 minutes.',
    'Saler, poivrer la viande.',
    'Disposer la viande dans un plat, couvrir de purée et fromage.',
    'Cuire 25 minutes à 200 °C.',
  ]),
  r('dahl-lentilles', 'Dahl de lentilles corail', 'eco', 30, 4, [
    [300, 'g', 'Lentilles corail'], [400, 'ml', 'Lait de coco'], [2, 'pc', 'Tomate'],
    [1, 'pc', 'Oignon'], [3, 'gousse', 'Ail'], [1, 'pc', 'Gingembre'],
    [2, 'cc', 'Curry'], [1, 'cc', 'Cumin'], [200, 'g', 'Riz'],
    [1, 'botte', 'Coriandre'],
  ], [
    'Cuire le riz à part.',
    'Faire revenir oignon, ail et gingembre.',
    'Ajouter épices et tomates en dés. Cuire 3 minutes.',
    'Ajouter lentilles, lait de coco et 300 ml d\'eau.',
    'Mijoter 20 minutes. Servir avec coriandre et riz.',
  ]),
  r('riz-cantonais', 'Riz cantonais', 'eco', 25, 4, [
    [300, 'g', 'Riz'], [200, 'g', 'Jambon'], [200, 'g', 'Petits pois'],
    [3, 'pc', 'Œufs'], [1, 'pc', 'Oignon'], [3, 'cs', 'Sauce soja'],
    [2, 'cs', 'Huile de sésame'],
  ], [
    'Cuire le riz, le laisser refroidir.',
    'Faire une omelette fine, la couper en lamelles.',
    'Faire revenir oignon, ajouter jambon en dés et petits pois.',
    'Ajouter le riz, sauter 5 minutes.',
    'Verser sauce soja, ajouter l\'omelette en lamelles.',
  ]),

  // === FAMILIAUX ===
  r('lasagnes', 'Lasagnes à la bolognaise', 'famille', 90, 4, [
    [12, 'pc', 'Lasagnes'], [600, 'g', 'Steak haché'], [400, 'g', 'Tomates concassées'],
    [1, 'pc', 'Oignon'], [2, 'gousse', 'Ail'], [400, 'ml', 'Lait'],
    [40, 'g', 'Beurre'], [40, 'g', 'Farine'], [150, 'g', 'Parmesan'],
    [2, 'cs', 'Huile d\'olive'],
  ], [
    'Faire revenir oignon et ail, ajouter le bœuf et dorer.',
    'Ajouter les tomates, mijoter 30 minutes. Saler, poivrer.',
    'Préparer une béchamel avec beurre, farine et lait.',
    'Alterner pâtes, bolognaise, béchamel dans un plat.',
    'Terminer par béchamel et parmesan.',
    'Cuire 30 minutes à 180 °C.',
  ]),
  r('pates-pesto-poulet', 'Pâtes au pesto et poulet', 'famille', 25, 4, [
    [400, 'g', 'Penne'], [500, 'g', 'Blanc de poulet'], [120, 'g', 'Pesto'],
    [200, 'g', 'Tomate'], [50, 'g', 'Parmesan'], [2, 'cs', 'Huile d\'olive'],
  ], [
    'Cuire les pâtes al dente.',
    'Couper le poulet en lamelles, le faire dorer dans l\'huile.',
    'Couper les tomates en dés.',
    'Égoutter les pâtes, mélanger pesto, poulet et tomates.',
    'Servir avec parmesan râpé.',
  ]),
  r('gratin-pates-jambon', 'Gratin de pâtes au jambon', 'famille', 45, 4, [
    [400, 'g', 'Penne'], [4, 'tranche', 'Jambon'], [300, 'ml', 'Crème fraîche'],
    [200, 'g', 'Fromage râpé'], [40, 'g', 'Beurre'], [1, 'pincée', 'Noix de muscade'],
  ], [
    'Cuire les pâtes al dente.',
    'Couper le jambon en lanières.',
    'Mélanger pâtes, jambon et crème dans un plat beurré.',
    'Couvrir de fromage, ajouter muscade.',
    'Cuire 25 minutes à 180 °C.',
  ]),

  // === MONDE ===
  r('pad-thai', 'Pad thaï au poulet', 'monde', 30, 4, [
    [300, 'g', 'Nouilles de riz'], [400, 'g', 'Blanc de poulet'], [200, 'g', 'Germes de soja'],
    [3, 'pc', 'Œufs'], [80, 'g', 'Cacahuètes'], [3, 'cs', 'Sauce nuoc-mam'],
    [2, 'cs', 'Sauce soja'], [1, 'pc', 'Citron vert'], [2, 'gousse', 'Ail'],
    [1, 'cs', 'Huile de sésame'], [1, 'botte', 'Coriandre'],
  ], [
    'Tremper les nouilles 10 minutes dans l\'eau chaude.',
    'Couper le poulet, le faire sauter au wok dans l\'huile.',
    'Ajouter ail, casser les œufs et brouiller.',
    'Ajouter nouilles, sauces et germes de soja.',
    'Servir avec cacahuètes concassées, citron vert et coriandre.',
  ]),
  r('chili-con-carne', 'Chili con carne', 'monde', 60, 4, [
    [600, 'g', 'Steak haché'], [400, 'g', 'Haricots rouges'], [400, 'g', 'Tomates concassées'],
    [1, 'pc', 'Oignon'], [2, 'gousse', 'Ail'], [1, 'pc', 'Poivron'],
    [2, 'cc', 'Cumin'], [1, 'cc', 'Paprika'], [1, 'pincée', 'Piment'],
    [200, 'g', 'Riz'],
  ], [
    'Faire revenir oignon, ail et poivron.',
    'Ajouter le bœuf et dorer.',
    'Incorporer épices, tomates et haricots égouttés.',
    'Mijoter 40 minutes à découvert.',
    'Servir avec le riz.',
  ]),
  r('couscous-merguez', 'Couscous merguez', 'monde', 60, 4, [
    [8, 'pc', 'Merguez'], [400, 'g', 'Blanc de poulet'], [3, 'pc', 'Carotte'],
    [2, 'pc', 'Courgette'], [400, 'g', 'Pois chiches'], [1, 'pc', 'Oignon'],
    [400, 'g', 'Tomates concassées'], [300, 'g', 'Semoule'],
    [2, 'cc', 'Cumin'], [1, 'cc', 'Curcuma'],
  ], [
    'Faire dorer le poulet en morceaux, réserver.',
    'Faire revenir l\'oignon, ajouter carottes et courgettes en tronçons.',
    'Ajouter tomates, pois chiches, épices et 500 ml d\'eau.',
    'Remettre le poulet, mijoter 40 minutes.',
    'Cuire les merguez à part, préparer la semoule.',
    'Servir le bouillon, les légumes, viandes et semoule.',
  ]),
  r('paella', 'Paella', 'monde', 60, 4, [
    [300, 'g', 'Riz arborio'], [400, 'g', 'Blanc de poulet'], [200, 'g', 'Crevettes'],
    [200, 'g', 'Chorizo'], [1, 'pc', 'Poivron'], [1, 'pc', 'Oignon'],
    [200, 'g', 'Petits pois'], [1, 'pincée', 'Safran'], [800, 'ml', 'Bouillon de volaille'],
    [3, 'cs', 'Huile d\'olive'],
  ], [
    'Faire dorer poulet et chorizo en rondelles.',
    'Ajouter oignon et poivron émincés.',
    'Verser le riz, nacrer 2 minutes.',
    'Ajouter le bouillon avec le safran. Mijoter 18 minutes.',
    'Ajouter crevettes et petits pois 5 minutes avant la fin.',
  ]),

  // === FOUR ===
  r('pizza-maison', 'Pizza maison', 'four', 35, 4, [
    [1, 'pc', 'Pâte à pizza'], [200, 'g', 'Sauce tomate'], [200, 'g', 'Mozzarella'],
    [4, 'tranche', 'Jambon'], [200, 'g', 'Champignons de paris'],
    [1, 'botte', 'Basilic'], [1, 'cs', 'Huile d\'olive'],
  ], [
    'Préchauffer le four à 240 °C.',
    'Étaler la pâte sur une plaque.',
    'Tartiner de sauce tomate.',
    'Disposer mozzarella, jambon et champignons.',
    'Cuire 12 minutes. Ajouter basilic et un filet d\'huile.',
  ]),
  r('quiche-lorraine', 'Quiche lorraine', 'four', 50, 4, [
    [1, 'pc', 'Pâte brisée'], [200, 'g', 'Lardons'], [4, 'pc', 'Œufs'],
    [200, 'ml', 'Crème fraîche'], [200, 'ml', 'Lait'], [100, 'g', 'Gruyère'],
    [1, 'pincée', 'Noix de muscade'],
  ], [
    'Préchauffer le four à 180 °C.',
    'Foncer un moule avec la pâte.',
    'Faire revenir les lardons à sec, les répartir sur la pâte.',
    'Battre œufs, crème, lait, sel, poivre et muscade.',
    'Verser sur les lardons, parsemer de gruyère.',
    'Cuire 35 minutes.',
  ]),

  // === SAUCE ===
  r('boulettes-tomate', 'Boulettes sauce tomate', 'sauce', 45, 4, [
    [600, 'g', 'Steak haché'], [1, 'pc', 'Œufs'], [50, 'g', 'Pain'],
    [400, 'g', 'Tomates concassées'], [1, 'pc', 'Oignon'], [2, 'gousse', 'Ail'],
    [1, 'cs', 'Huile d\'olive'], [400, 'g', 'Spaghetti'], [1, 'botte', 'Basilic'],
  ], [
    'Mélanger bœuf, œuf et pain trempé. Former des boulettes.',
    'Faire dorer les boulettes dans l\'huile, réserver.',
    'Faire revenir oignon et ail, ajouter les tomates.',
    'Remettre les boulettes, mijoter 20 minutes.',
    'Cuire les pâtes. Servir avec la sauce et le basilic.',
  ]),
  r('poulet-basquaise', 'Poulet basquaise', 'sauce', 60, 4, [
    [4, 'pc', 'Cuisses de poulet'], [3, 'pc', 'Poivron'], [3, 'pc', 'Tomate'],
    [1, 'pc', 'Oignon'], [3, 'gousse', 'Ail'], [100, 'g', 'Chorizo'],
    [200, 'ml', 'Vin blanc'], [200, 'g', 'Riz'], [2, 'cs', 'Huile d\'olive'],
  ], [
    'Faire dorer les cuisses, réserver.',
    'Faire revenir oignon, ail, poivrons et chorizo.',
    'Ajouter les tomates en dés, déglacer au vin blanc.',
    'Remettre les cuisses, couvrir, mijoter 40 minutes.',
    'Servir avec le riz.',
  ]),
];

// === RECETTES DU DOSSIER Docs (imports minimalistes) ===
// Ces entrées pointent vers les fichiers PDF/docx dans Docs/
const docs = [
  { id: 'docs-plats-bouglour-lentilles-poulet', name: 'Bouglour et lentilles corail émincés de poulet courgette et carottes', file: 'Docs/Plats/Bouglour et lentilles corail émincés de poulet courgette et carottes.pdf' },
  { id: 'docs-plats-cabillaud-curry', name: 'Cabillaud aux légumes et au curry rouge', file: 'Docs/Plats/Cabillaud aux légumes et au curry rouge.pdf' },
  { id: 'docs-plats-conchiglioni-farcis', name: 'Conchiglioni farcis ricotta épinards', file: 'Docs/Plats/Conchiglioni farcis ricotta épinards.pdf' },
  { id: 'docs-plats-courgette-farcie-quinoa', name: 'Courgette farcie au quinoa', file: 'Docs/Plats/Courgette farcie au quinoa.pdf' },
  { id: 'docs-plats-croque-saumon', name: 'Croque monsieur au saumon', file: 'Docs/Plats/Croque monsieur au saumon.pdf' },
  { id: 'docs-plats-crepes-salees', name: 'Crêpes salées idées', file: 'Docs/Plats/Crêpes salées idées.pdf' },
  { id: 'docs-plats-ebly-legumes-jambon', name: 'Ebly légumes et jambon au four', file: 'Docs/Plats/Ebly légumes et jambon au four.pdf' },
  { id: 'docs-plats-frites-patate-douce', name: 'Frites de patate douce au four et rillette de thon', file: 'Docs/Plats/Frites de patate douce au four et rillette de thon.pdf' },
  { id: 'docs-plats-gratin-poisson', name: 'Gratin de poisson aux légumes', file: 'Docs/Plats/Gratin de poisson aux légumes.pdf' },
  { id: 'docs-plats-gratin-riz-jambon', name: 'Gratin de riz jambon courgette', file: 'Docs/Plats/Gratin de riz jambon courgette.pdf' },
  { id: 'docs-plats-hache-boeuf-wraps', name: 'Haché de boeuf aux légumes et ses wraps', file: 'Docs/Plats/Haché de boeuf aux légumes et ses wraps.pdf' },
  { id: 'docs-plats-hamburger-frites', name: 'Hamburger maison et frites de patate douce', file: 'Docs/Plats/Hamburger maison et frites de patate douce.pdf' },
  { id: 'docs-plats-lasagne-panais-potimarron', name: 'Lasagne de panais et potimarron', file: 'Docs/Plats/Lasagne de panais et potimarron.pdf' },
  { id: 'docs-plats-lasagne-express-legumes', name: 'Lasagne express aux légumes', file: 'Docs/Plats/Lasagne express aux légumes.pdf' },
  { id: 'docs-plats-linguine-scampis', name: 'Linguine scampis chorizo et mozzarella', file: 'Docs/Plats/Linguine scampis chorizo et mozzarella.pdf' },
  { id: 'docs-plats-oeuf-pdt-carottes', name: 'Oeuf au plat carottes et courgettes', file: 'Docs/Plats/Oeuf au plat carottes et courgettes.pdf' },
  { id: 'docs-plats-oeufs-brouilles', name: 'Oeufs brouillés aux légumes', file: 'Docs/Plats/Oeufs brouillés aux légumes.pdf' },
  { id: 'docs-plats-paupiette-poulet', name: 'Paupiette de poulet au jambon et olives', file: 'Docs/Plats/Paupiette de poulet au jambon et olives.pdf' },
  { id: 'docs-plats-pizza-equilibree', name: 'Pizza équilibrée faite maison', file: 'Docs/Plats/Pizza équilibrée faite maison.pdf' },
  { id: 'docs-plats-plumes-chef', name: 'Plumes du chef', file: 'Docs/Plats/Plumes du chef.docx' },
  { id: 'docs-plats-poisson-pane-avoine', name: 'Poisson blanc pané aux flocons d\'avoine', file: 'Docs/Plats/Poisson blanc pané aux flocons d\'avoine.pdf' },
  { id: 'docs-plats-poivrons-farcis', name: 'Poivrons farcis au poulet courgette semoule et coulis de tomates', file: 'Docs/Plats/Poivrons farcis au poulet courgette semoule et coulis de tomates.pdf' },
  { id: 'docs-plats-poelee-pdt-bacon', name: 'Poêlée de pommes de terre bacon oeufs et petits légumes', file: 'Docs/Plats/Poêlée de pommes de terre bacon oeufs et petits légumes.pdf' },
  { id: 'docs-plats-pates-brioches-choco', name: 'Pâtes brioches aux pépites de chocolat', file: 'Docs/Plats/Pâtes brioches aux pépites de chocolat.pdf' },
  { id: 'docs-plats-pates-complètes-scampis', name: 'Pâtes complètes aux légumes et aux scampis', file: 'Docs/Plats/Pâtes complètes aux légumes et aux scampis.pdf' },
  { id: 'docs-plats-pates-brocoli-oeuf-jambon', name: 'Pâtes complètes brocoli oeuf et jambon bacon', file: 'Docs/Plats/Pâtes complètes brocoli oeuf et jambon bacon.pdf' },
  { id: 'docs-plats-pates-jambon-italien', name: 'Pâtes jambon italien parmesan', file: 'Docs/Plats/Pâtes jambon italien parmesan.pdf' },
  { id: 'docs-plats-pates-sauce-poivrons', name: 'Pâtes sauce aux poivronscarottes jambon cuit de Malmedy et courgettes', file: 'Docs/Plats/Pâtes sauce aux poivronscarottes jambon cuit de Malmedy et courgettes.pdf' },
  { id: 'docs-plats-pates-tomates-aubergine-burrata', name: 'Pâtes tomates aubergine et burrata', file: 'Docs/Plats/Pâtes tomates aubergine et burrata.pdf' },
  { id: 'docs-plats-peche-thon-salade', name: 'Pêche au thon salade de pâtes aux légumes et salade', file: 'Docs/Plats/Pêche au thon salade de pâtes aux légumes et salade.pdf' },
  { id: 'docs-plats-quiche-legumes-mozza', name: 'Quiche aux légumes et à la mozzarella', file: 'Docs/Plats/Quiche aux légumes et à la mozzarella.pdf' },
  { id: 'docs-plats-quiche-oignons-poireaux', name: 'Quiche oignons poireaux et allumettes de bacon', file: 'Docs/Plats/Quiche oignons poireaux et allumettes de bacon.pdf' },
  { id: 'docs-plats-quinoa-legumes-ete', name: 'Quinoa aux légumes d\'été', file: 'Docs/Plats/Quinoa aux légumes d\'été.pdf' },
  { id: 'docs-plats-quinoa-mais-haricots', name: 'Quinoa maïs et haricots rouges', file: 'Docs/Plats/Quinoa maïs et haricots rouges.pdf' },
  { id: 'docs-plats-riz-basmati-saumon', name: 'Riz basmati au saumon pois gourmand et lait de coco', file: 'Docs/Plats/Riz basmati au saumon pois gourmand et lait de coco.pdf' },
  { id: 'docs-plats-salade-ete', name: 'Salade d\'été', file: 'Docs/Plats/Salade d\'été.pdf' },
  { id: 'docs-plats-samossas-courgette-chevre', name: 'Samossas courgette et chèvre', file: 'Docs/Plats/Samossas courgette et chèvre.pdf' },
  { id: 'docs-plats-sauce-tomates-haricots', name: 'Sauce tomates aux haricots rouges', file: 'Docs/Plats/Sauce tomates aux haricots rouges.pdf' },
  { id: 'docs-plats-soupe-nouilles-epicee', name: 'Soupe de nouilles légèrement épicée', file: 'Docs/Plats/Soupe de nouilles légèrement épicée.pdf' },
  { id: 'docs-plats-tarte-oignons-poivrons-feta', name: 'Tarte oignons poivrons feta et pois chiches', file: 'Docs/Plats/Tarte oignons poivrons feta et pois chiches.pdf' },
  { id: 'docs-plats-tarte-salee-epinards-poivron-lieu', name: 'Tarte salée épinards poivron et lieu jaune', file: 'Docs/Plats/Tarte salée épinards poivron et lieu jaune.pdf' },
  { id: 'docs-plats-tartiflette', name: 'Tartiflette plus ou moins légère', file: 'Docs/Plats/Tartiflette plus ou moins légère.pdf' },
  { id: 'docs-plats-tomate-crevettes', name: 'Tomate crevettes salade de pâtes froides et salade aux graines oléagineuses', file: 'Docs/Plats/Tomate crevettes salade de pâtes froides et salade aux graines oléagineuses.pdf' },
  { id: 'docs-plats-tortiglioni-champignons', name: 'Tortiglioni sauce légère aux champignons', file: 'Docs/Plats/Tortiglioni sauce légère aux champignons.pdf' },
  { id: 'docs-plats-wraps', name: 'Wraps maison', file: 'Docs/Plats/Wraps maison.pdf' },

  // Desserts
  { id: 'docs-desserts-cantuchini', name: 'cantuchini', file: 'Docs/Desserts/cantuchini.pdf' },
  { id: 'docs-desserts-clafoutis-framboises-myrtilles', name: 'Clafoutis aux framboises et myrtilles', file: 'Docs/Desserts/Clafoutis aux framboises et myrtilles.pdf' },
  { id: 'docs-desserts-flans-legumes', name: 'Flans aux légumes', file: 'Docs/Desserts/Flans aux légumes.pdf' },
  { id: 'docs-desserts-gateau-choco-laurie', name: 'Gâteau au chocolat de Laurie', file: 'Docs/Desserts/Gâteau au chocolat de Laurie.docx' },
  { id: 'docs-desserts-gateau-choco-domi', name: 'Gâteau au chocolat domi', file: 'Docs/Desserts/Gâteau au chocolat domi.pdf' },
  { id: 'docs-desserts-gateau-flocons-avoine', name: 'Gâteau aux flocons d\'avoine pomme de terre cannelle', file: 'Docs/Desserts/Gâteau aux flocons d\'avoine pomme de terre cannelle.pdf' },
  { id: 'docs-desserts-pudding-vanille', name: 'Pudding à la vanille', file: 'Docs/Desserts/Pudding à la vanille.pdf' },
  { id: 'docs-desserts-riz-au-lait', name: 'Riz au lait', file: 'Docs/Desserts/Riz au lait.pdf' },
  { id: 'docs-desserts-torta-paradiso', name: 'Torta Paradiso', file: 'Docs/Desserts/Torta Paradiso.docx' },

  // Apéro
  { id: 'docs-apero-boulettes-flocons-courgette', name: 'Boulettes apéritives aux flocons d\'avoine et à la courgette', file: 'Docs/Apéro/Boulettes apéritives aux flocons d\'avoine et à la courgette.pdf' },
  { id: 'docs-apero-pois-chiches-grilles', name: 'Pois chiches grillés pour l\'apéro', file: 'Docs/Apéro/Pois chiches grillés pour l\'apéro.pdf' },
  { id: 'docs-apero-roules-courgettes-saumon', name: 'Roulés apéritifs de courgettes au saumon fumé', file: 'Docs/Apéro/Roulés apéritifs de courgettes au saumon fumé.pdf' },
  { id: 'docs-apero-toasts-crevettes', name: 'Toasts crevettes tomates sechées', file: 'Docs/Apéro/Toasts crevettes tomates sechées.pdf' },

  // En-cas
  { id: 'docs-encas-biscuits-fromage-blanc', name: 'Biscuits au fromage blanc et au yaourt nature pépites de chocolat', file: 'Docs/En-cas/Biscuits au fromage blanc et au yaourt nature pépites de chocolat.pdf' },
  { id: 'docs-encas-biscuits-avoine-banane', name: 'Biscuits avoine banane choco', file: 'Docs/En-cas/Biscuits avoine banane choco.pdf' },
  { id: 'docs-encas-cake-courgettes-chevre', name: 'Cake courgettes et chèvre', file: 'Docs/En-cas/Cake courgettes et chèvre.pdf' },
  { id: 'docs-encas-crunchy-muesli', name: 'Crunchy muesli - Granola', file: 'Docs/En-cas/Crunchy muesli - Granola.pdf' },
  { id: 'docs-encas-gaufres-banane', name: 'Gaufres à la banane', file: 'Docs/En-cas/Gaufres à la banane.pdf' },
  { id: 'docs-encas-granola-noisettes-choco', name: 'Granola aux noisettes et au chocolat noir', file: 'Docs/En-cas/Granola aux noisettes et au chocolat noir.pdf' },
  { id: 'docs-encas-minis-cakes-sales', name: 'Minis cakes salés courgette carottes et filet de Saxe', file: 'Docs/En-cas/Minis cakes salés courgette carottes et filet de Saxe.pdf' },
  { id: 'docs-encas-muffins-choco-courgette', name: 'Muffins chocolat noir et courgette', file: 'Docs/En-cas/Muffins chocolat noir et courgette.pdf' },

  // Petits déjeuner
  { id: 'docs-petitdej-pancakes-yaourt', name: 'Pancakes au yaourt', file: 'Docs/Petits déjeuner/Pancakes au yaourt.pdf' },
  { id: 'docs-petitdej-pancakes-banane', name: 'Pancakes à la banane', file: 'Docs/Petits déjeuner/Pancakes à la banane.pdf' },
  { id: 'docs-petitdej-pancakes-compote', name: 'Pancakes à la compote de pommes', file: 'Docs/Petits déjeuner/Pancakes à la compote de pommes.pdf' },
  { id: 'docs-petitdej-pancakes-patate-douce', name: 'Pancakes à la patate douce', file: 'Docs/Petits déjeuner/Pancakes à la patate douce.pdf' },
];

for (const d of docs) {
  SEED_RECIPES.push({
    id: d.id,
    name: d.name,
    cat: null,
    time: 20,
    portions: 4,
    ingredients: [],
    steps: [],
    file: d.file,
  });
}

// Classifier toutes les recettes qui n'ont pas de catégorie
for (const rec of SEED_RECIPES) {
  if (!rec.cat) rec.cat = inferCategory(rec.name, rec.ingredients || []);
}

// Réparer la recette mijoté de poisson — colle au screenshot d'origine
SEED_RECIPES.find(x => x.id === 'mijote-poisson-coco').ingredients = [
  { qty: 600, unit: 'g',  name: 'Cabillaud' },
  { qty: 400, unit: 'ml', name: 'Lait de coco' },
  { qty: 2,   unit: 'cs', name: 'Pâte de curry' },
  { qty: 1,   unit: 'pc', name: 'Échalote' },
  { qty: 1,   unit: 'pc', name: 'Oignon' },
  { qty: 600, unit: 'g',  name: 'Pomme de terre' },
  { qty: 1,   unit: 'botte', name: 'Coriandre' },
  { qty: 2,   unit: 'cs', name: 'Huile d\'olive' },
];

export default SEED_RECIPES;
