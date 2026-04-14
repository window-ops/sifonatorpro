;(function(){
const ABOUT_EGG_STORIES=[
  {
    title:'Moara cu noroc',
    accept:['moara cu noroc','moara cu noroc de ioan slavici','ioan slavici moara cu noroc'],
    text:`Omul să fie mulțumit cu sărăcia sa, căci, dacă e vorba, nu bogăția, ci liniștea colibei tale te face fericit. Dar voi să faceți după cum vă trage inima, și Dumnezeu să vă ajute și să vă acopere cu aripa bunătății sale. Eu sunt acum bătrână, și fiindcă am avut și am atât de multe bucurii în viață, nu înțeleg nemulțumirile celor tineri și mă tem ca nu cumva, căutând acum la bătrânețe un noroc nou, să pierd pe acela de care am avut parte până în ziua de astăzi și să dau la sfârșitul vieții mele de amărăciunea pe care nu o cunosc decât din frică. Voi știți, voi faceți; de mine să nu ascultați. Mi-e greu să-mi părăsesc coliba în care mi-am petrecut viața și mi-am crescut copiii și mă cuprinde un fel de spaimă când mă gândesc să rămân singură într-însa: de aceea, poate că mai ales de aceea, Ana îmi părea prea tânără, prea așezată, oarecum prea blândă la fire, și-mi vine să râd când mi-o închipuiesc cârciumăriță.`
  },
  {
    title:'O scrisoare pierdută',
    accept:['o scrisoare pierduta','o scrisoare pierdută','caragiale o scrisoare pierduta','i l caragiale o scrisoare pierduta'],
    text:`TIPĂTESCU, puțin agitat, se plimbă cu „Răcnetul Carpaților” în mână; e în haine de odaie; PRISTANDA în picioare, mai spre ușă, stă rezemat în sabie.

TIPĂTESCU (terminând de citit o frază din jurnal): „…Rușine pentru orașul nostru să tremure în fața unui om!… Rușine pentru guvernul vitreg, care dă unul din cele mai frumoase județe ale României pradă în ghearele unui vampir!…” (indignat) Eu vampir, ‘ai?… Caraghioz!

PRISTANDA (asemenea): Curat caraghioz!… Pardon, să iertați, coane Fănică, că întreb: bambir… ce-i aia, bampir?

TIPĂTESCU: Unul… unul care suge sângele poporului… Eu sug sângele poporului!…

PRISTANDA: Dumneata sugi sângele poporului!… Aoleu!

TIPĂTESCU: Mișel!

PRISTANDA: Curat mișel!`
  },
  {
    title:'Conu Leonida față cu reacțiunea',
    accept:['conu leonida fata cu reactiunea','conu leonida față cu reacțiunea','caragiale conu leonida','ion luca caragiale conu leonida fata cu reactiunea'],
    text:`LEONIDA (sculându-se din somn spăimântat)\n\nAi! Ce e?\n\nEFIMIŢA\n\nLeonido! Scoal’ că-i foc, Leonido!\n\nLEONIDA\n\nMiţule, nu-i nimica; ştii cum este dumneata nevricoasă…`
  },
  {
    title:'D-ale carnavalului',
    accept:['d-ale carnavalului','d ale carnavalului','caragiale d ale carnavalului','ion luca caragiale d ale carnavalului'],
    text:`PAMPON (în costum, intrând din bal)\n\nEste adevărat că sunt tradus: Didina mă înşeală…\n\nA! Bibicule! Ai scos o femeie din minţi - femei!\n\nAstă dată n-ai să scapi… O să-ţi rup şalele…`
  },
  {
    title:'O noapte furtunoasă',
    accept:['o noapte furtunoasa','o noapte furtunoasă','caragiale o noapte furtunoasa','ion luca caragiale o noapte furtunoasa'],
    text:`Iaca, nişte papugii... nişte scârţa-scârţa pe hârtie!\n\n’I ştim noi! Mănâncă pe datorie, bea pe veresie,\ntrag lumea pe sfoară cu pişicherlicuri...`
  },
  {
    title:'O noapte furtunoasă',
    accept:['o noapte furtunoasa','o noapte furtunoasă','caragiale o noapte furtunoasa','ion luca caragiale o noapte furtunoasa'],
    text:`SPIRIDON (singur)\n\nMăă! al dracului rumân și jupânul nostru!\n\nBine l-a botezat cine l-a botezat „Titircă Inimă-Rea”.\n\n…Stai că-ți fac eu ție poftă de culcat!`
  },
  {
    title:'Răscoala',
    accept:['rascoala','răscoala','liviu rebreanu rascoala','liviu rebreanu răscoala'],
    text:`Trenul duduia și fumega ca un animal apocaliptic.`
  },
  {
    title:'Ion',
    accept:['ion','liviu rebreanu ion','rebreanu ion'],
    text:`Duminică. Satul e la horă.\n\nȘi hora e pe Ulița din dos…\n\nLocul geme de oameni…`
  },
  {
    title:'Take, Ianke și Cadâr',
    accept:['take ianke si cadar','take, ianke si cadar','take ianke și cadâr','victor ion popa take ianke si cadar'],
    text:`TAKE, IANKE\n\nIANKE: Nu te duci să mănânci?\n\nTAKE: Nu prea.\n\nIANKE: Faci economie!\n\nTAKE: …Bătrânețea…`
  },
  {
    title:'Take, Ianke și Cadâr',
    accept:['take ianke si cadar','take, ianke si cadar','take ianke și cadâr','victor ion popa take ianke si cadar'],
    text:`(Se petrece într-o seară, după aprinderea lămpilor…)\n\nVezi spatele caselor lui Ianke și Take…\n\nO simetrie perfectă.`
  },
  {
    title:'Sobieski și românii',
    accept:['sobieski si romanii','sobieski și românii','constantin negruzzi sobieski si romanii','negruzzi sobieski si romanii'],
    text:`Pe drumul ce duce către cetatea Neamțului…\n\nse vedea o oaste mergând.\n\nNu se auzea nici surlă, nici tobă…`
  },
  {
    title:'Pădureanca',
    accept:['padureanca','pădureanca','ioan slavici padureanca','slavici padureanca'],
    text:`Fă trei cruci și zi „Doamne-ajută!” când treci pragul casei…\n\ncăci lumea din întâmplări se alcătuiește,\n\niar întâmplarea e noroc ori nenorocire…`
  },
  {
    title:'O făclie de Paște',
    accept:['o faclie de paste','o făclie de paște','caragiale o faclie de paste','ion luca caragiale o faclie de paste'],
    text:`Și omul plecă încetinel spre răsărit la deal,\n\nca un călător cuminte,\n\ncare știe că la un drum lung nu se pornește cu pasul pripit.`
  },
  {
    title:'Palatul de cleștar',
    accept:['palatul de clestar','palatul de cleștar','delavrancea palatul de clestar','barbu stefanescu delavrancea palatul de clestar'],
    text:`Cam pe la începutul vremilor…\n\nspun unii că pe atunci mergea mai bine\n\ncu minte dreaptă și fără de legi,\n\ndecât… cu legi drepte și cu minte strâmbă.`
  },
  {
    title:'Alexandru Lăpușneanul',
    accept:['alexandru lapusneanul','alexandru lapusneanu','constantin negruzzi alexandru lapusneanul','negruzzi alexandru lapusneanul'],
    text:`„Dacă voi nu mă vreți, eu vă vreu…”

și dacă voi nu mă iubiți, eu vă iubesc pre voi și voi merge ori cu voia, ori fără voia voastră.

Să mă întorc?… Mai degrabă-mi voi sfărâma coroana de capul vostru!`
  },
  {
    title:'Alexandru Lăpușneanul',
    accept:['alexandru lapusneanul','alexandru lapusneanu','constantin negruzzi alexandru lapusneanul','negruzzi alexandru lapusneanul'],
    text:`- Boaită fățarnică!…

M-ați popit voi, dar de mă voi îndrepta, pre mulți am să popesc și eu!

Minte acela ce zice că sînt călugăr! Eu nu sînt călugăr, sînt domn!`
  },
  {
    title:'Moara cu noroc',
    accept:['moara cu noroc','moara cu noroc de ioan slavici','ioan slavici moara cu noroc'],
    text:`De la Ineu drumul de țară o ia printre păduri și peste țarini…

Aici, în vale, e Moara cu noroc.

Și fiindcă aici se opresc toți drumeții, încetul cu încetul s-a făcut bătătură înaintea morii…`
  },
  {
    title:'O scrisoare pierdută',
    accept:['o scrisoare pierduta','o scrisoare pierdută','caragiale o scrisoare pierduta','i l caragiale o scrisoare pierduta'],
    text:`TRAHANACHE, FARFURIDI și BRÂNZOVENESCU stau împrejurul unei mese rotunde, studiând listele electorale; fiecare are câte un creion în mână.

BRÂNZOVENESCU: Șaizeci și nouă cu roșu, buni… unsprece cu albastru… ai lor…

FARFURIDI: Doisprezece…

TRAHANACHE: Ai puțintică răbdare… unu, doi, cinci… șapte… zece… unsprezece.

FARFURIDI: Doisprezece…

TRAHANACHE: Cu Ienache Siripeanu.`
  },
];
globalThis.ABOUT_EGG_STORIES=ABOUT_EGG_STORIES;
})();