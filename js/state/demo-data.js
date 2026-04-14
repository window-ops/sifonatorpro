;(function(){
const DEMO_PROJ=[
  {id:1,name:'Reabilitare DJ-507 (tronson comunal + podețe)',budget:2300000,realValue:1510000,declaredValue:2760000,status:'in_progress',quality:null,bet:null,due:'2026-07-15',lateS:false,lateF:false,hideFromWandQueue:true,projCategory:'infrastructura',procurementMode:'licitatie',dossier:[{t:'08.11.2025',txt:'Deschidere dosar, avize minime obținute.'},{t:'14.01.2026',txt:'Situație de lucrări: progres raportat 37%, ajustare deviz pe materiale.'},{t:'04.03.2026',txt:'Solicitare clarificări pe strat rutier; răspuns „în curs de centralizare”.'}]},
  {id:2,name:'Modernizare iluminat public (LED + telegestiune)',budget:1010000,realValue:620000,declaredValue:1080000,status:'completed',quality:'mantuiala',bet:null,due:'2025-12-01',lateS:false,lateF:false,projCategory:'infrastructura',procurementMode:'licitatie',dossier:[{t:'02.06.2025',txt:'Studiu de oportunitate aprobat în ședință ordinară.'},{t:'18.09.2025',txt:'Recepție parțială: funcțional, dar neuniform pe zone periferice.'},{t:'01.12.2025',txt:'Închidere dosar cu „recomandări” pentru mentenanță viitoare.'}]},
  {id:3,name:'Sală sport școlară - proiectare și asistență tehnică',budget:5200000,realValue:3240000,declaredValue:6480000,status:'planned',quality:null,bet:null,due:'2027-01-31',lateS:true,lateF:false,projCategory:'consultanta',procurementMode:'licitatie',dossier:[{t:'10.09.2026',txt:'Documentație faza SF depusă; lipsă două avize de utilități.'}]},
  {id:4,name:'Amenajare parc urban „Reziliență Climatică”',budget:1200000,realValue:780000,declaredValue:1510000,status:'in_progress',quality:null,bet:null,due:'2026-09-30',lateS:false,lateF:true,projCategory:'constructii',procurementMode:'licitatie',dossier:[{t:'22.01.2026',txt:'Contract semnat, ordin de începere emis.'},{t:'15.02.2026',txt:'Întârziere livrare mobilier urban din cauza „lanțului logistic”.'}]},
  {id:5,name:'Digitalizare arhivă (scanare + indexare + portal intern)',budget:560000,realValue:360000,declaredValue:590000,status:'completed',quality:'moderata',bet:null,due:'2026-01-15',lateS:false,lateF:false,projCategory:'it_digital',procurementMode:'licitatie',dossier:[{t:'05.11.2025',txt:'Migrare inițială a fondului arhivistic, lot 1.'},{t:'12.01.2026',txt:'Predare funcțională; training minimal pentru operatori.'}]},
  {id:6,name:'Consumabile curente administrație (toner + hârtie)',budget:180000,realValue:138000,declaredValue:180000,status:'completed',quality:'moderata',bet:null,due:'2025-02-20',lateS:false,lateF:false,projCategory:'consumabile',procurementMode:'direct',dossier:[{t:'10.01.2025',txt:'Achiziție directă inițiată în catalog electronic.'},{t:'18.02.2025',txt:'Recepție loturi consumabile; documente justificative arhivate.'}]},
  {id:7,name:'Platformă smart-city (trafic, camere, dispecerat)',budget:4200000,realValue:2640000,declaredValue:4930000,status:'in_progress',quality:null,bet:{quality:'moderata',stakeRep:4,createdAt:'2026-02-10T11:15:00.000Z'},due:'2027-03-30',lateS:false,lateF:false,projCategory:'it_digital',procurementMode:'licitatie',dossier:[{t:'12.12.2026',txt:'Cerințe tehnice publicate; anexă extinsă pe interoperabilitate.'},{t:'09.01.2027',txt:'Calendar rollout în 3 etape validat în comisie.'}]},
  {id:8,name:'Consolidare pod rutier + utilități adiacente',budget:7800000,realValue:5150000,declaredValue:8960000,status:'planned',quality:null,bet:null,due:'2027-03-15',lateS:false,lateF:false,projCategory:'infrastructura',procurementMode:'licitatie',dossier:[{t:'14.02.2026',txt:'Studiu geotehnic depus; urmează aprobări avize.'}]},
  {id:9,name:'Call-center cetățeni + helpdesk online',budget:640000,realValue:460000,declaredValue:700000,status:'completed',quality:'ridicata',bet:null,due:'2026-11-21',lateS:false,lateF:false,projCategory:'consultanta',procurementMode:'direct',dossier:[{t:'03.08.2026',txt:'SLA definit și pilot lansat pe două servicii publice.'},{t:'22.11.2026',txt:'Recepție finală cu timpi de răspuns în țintă.'}]},
  {id:10,name:'Reabilitare piață agroalimentară centrală',budget:1950000,realValue:1280000,declaredValue:2240000,status:'in_progress',quality:null,bet:null,due:'2026-02-28',lateS:true,lateF:false,projCategory:'constructii',procurementMode:'licitatie',dossier:[{t:'18.09.2025',txt:'Ordin de începere emis cu întârziere administrativă.'}]},
  {id:11,name:'Servicii de consultanță juridică anuală',budget:310000,realValue:210000,declaredValue:340000,status:'planned',quality:null,bet:null,due:'2026-12-20',lateS:false,lateF:false,projCategory:'consultanta',procurementMode:'direct',dossier:[{t:'04.01.2026',txt:'Caiet de sarcini revizuit conform observațiilor de legalitate.'}]},
  {id:12,name:'Rețea Wi-Fi publică în școli și biblioteci',budget:1320000,realValue:870000,declaredValue:1490000,status:'completed',quality:'mantuiala',bet:null,due:'2025-10-10',lateS:false,lateF:true,projCategory:'it_digital',procurementMode:'licitatie',dossier:[{t:'12.06.2025',txt:'Implementare etapizată pe 27 de locații.'},{t:'08.10.2025',txt:'Finalizare cu întârzieri pe partea de mentenanță.'}]},
];
const DEMO_TEND=[
  {id:1,projectId:1,name:'Modernizare DJ-507, lot execuție și semnalizare',budget:3500000,status:'clarificari',winner:null,procType:'open'},
  {id:2,projectId:3,name:'Servicii consultanță proiecte finanțare europeană',budget:750000,status:'evaluation',winner:null,procType:'restricted'},
  {id:3,projectId:5,name:'Echipamente scanare, OCR și licențe arhivă digitală',budget:2100000,status:'awarded',winner:'SC Document Digital Systems SRL',procType:'open'},
  {id:4,projectId:4,name:'Amenajare parc urban - mobilier, irigații, iluminat',budget:1800000,status:'contested',winner:'SC Urban Verde Construct SRL',procType:'restricted'},
  {id:5,projectId:2,name:'Modernizare iluminat stradal LED cu telegestiune',budget:1010000,status:'executie',winner:'SC Electro Urban Smart SRL',procType:'open'},
  {id:6,projectId:7,name:'Hub date trafic + analiză AI pentru intersecții',budget:2500000,status:'depuneri',winner:null,procType:'open'},
  {id:7,projectId:8,name:'Consolidare pod, lot 1 infrastructură',budget:4200000,status:'open',winner:null,procType:'open'},
  {id:8,projectId:10,name:'Amenajare piață centrală și spații comerciale',budget:1650000,status:'evaluation',winner:null,procType:'restricted'},
  {id:9,projectId:12,name:'Pachet Wi-Fi educațional multisite',budget:1320000,status:'awarded',winner:'SC NetEdu Integration SRL',procType:'open'},
  {id:10,projectId:1,name:'Mentenanță suplimentară DJ-404 pe 24 luni',budget:690000,status:'open',winner:null,procType:'restricted'},
  {id:11,projectId:11,name:'Asistență juridică specializată litigii achiziții',budget:295000,status:'clarificari',winner:null,procType:'restricted'},
];
const DEMO_LOG=[
  {t:'09:14',txt:'Proiect „Modernizare iluminat” finalizat după intrarea contractului în execuție. +1 punct reputație.'},
  {t:'10:32',txt:'Licitație „Echipamente scanare, OCR și licențe arhivă digitală” adjudecată.'},
  {t:'11:05',txt:'Sesiune Bagheta Magică: surplus 635.000 RON identificat în diferența declarat/real.'},
  {t:'13:45',txt:'Proiect „Digitalizare arhivă” finalizat. +2 puncte reputație.'},
  {t:'14:20',txt:'Contestație pe „Amenajare parc urban” respinsă la comisia internă. Pe hârtie: impecabil.'},
  {t:'15:02',txt:'Proiect „Consumabile curente administrație” finalizat prin achiziție directă (sub prag Legea 98/2016).'},
  {t:'15:28',txt:'Manager Integrări: PSD Direct Connect activat (cheie validată).'},
  {t:'16:05',txt:'ANAF Sync: certificat confirmat, dosar procedural finalizat (6/6).'},
  {t:'16:42',txt:'Mântuire Proiecte: cerere #mnt_demo_01 procesată cu succes (+10 reputație).'},
  {t:'17:10',txt:'Presa: spillover național pe tema investițiilor locale „accelerate”.'},
  {t:'17:44',txt:'Justiție: presiunea crește după valul de contestații și expunere media.'},
];
const DEMO_REPH=[
  {t:'Proiect „Modernizare iluminat” finalizat (de mântuială)',d:1},
  {t:'Proiect „Digitalizare arhivă” finalizat (calitate moderată)',d:2},
  {t:'Proiect „Consumabile curente administrație” finalizat (calitate moderată)',d:2},
  {t:'Mântuire Proiecte: succes pe cheie live (bonus reputație)',d:10},
  {t:'Contestații și expunere presă pe proiecte mari',d:-3},
  {t:'Proiect neînceput la termen (sală sport)',d:-2},
];
globalThis.DEMO_PROJ=DEMO_PROJ;
globalThis.DEMO_TEND=DEMO_TEND;
globalThis.DEMO_LOG=DEMO_LOG;
globalThis.DEMO_REPH=DEMO_REPH;
})();