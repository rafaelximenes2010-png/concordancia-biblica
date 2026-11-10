# Dados de Mapas e Jornadas Bíblicas — SOLA | Bíblia & Teologia
# Fontes: (B) texto bíblico; (H) evidência histórica/arqueológica; (T) tradição cristã; (Hp) hipótese/reconstrução.
# Coordenadas aproximadas (graus decimais), compiladas a partir de identificações arqueológicas amplamente aceitas.
import json
L = {}
def lugar(id, n, m, lat, lon, c, d, r=()):
    L[id] = {"n": n, "m": m, "lat": lat, "lon": lon, "c": c, "d": d, "r": list(r)}

# ---------- Antigo Testamento ----------
lugar("ur","Ur dos caldeus","Tell el-Muqayyar, Iraque",30.96,46.10,"provável","Cidade suméria no sul da Mesopotâmia, ponto de partida de Abrão com Terá. A identificação com Tell el-Muqayyar é a mais aceita; alguns propõem um local no norte (hipótese).",["Gn 11:31","Gn 15:7","Ne 9:7","At 7:2-4"])
lugar("hara","Harã","Harran, Turquia",36.86,39.03,"certo","Cidade comercial no alto Eufrates onde Terá morreu e Abrão recebeu a ordem de partir para Canaã.",["Gn 11:31-32","Gn 12:4-5","Gn 28:10"])
lugar("siquem","Siquém","Tell Balata, perto de Nablus",32.21,35.28,"certo","Primeira parada de Abrão em Canaã, onde Deus prometeu a terra. Mais tarde, local da renovação da aliança com Josué.",["Gn 12:6-7","Gn 33:18","Js 24:1","Jo 4:5"])
lugar("betel","Betel","Beitin (provável)",31.93,35.22,"provável","Abrão levantou um altar entre Betel e Ai; Jacó teve ali o sonho da escada.",["Gn 12:8","Gn 28:19","Jz 20:26","1Rs 12:29"])
lugar("ai","Ai","et-Tell ou Khirbet el-Maqatir (debatido)",31.92,35.26,"incerto","Cidade conquistada por Josué após a derrota inicial. A localização exata é debatida pelos arqueólogos.",["Gn 12:8","Js 7:2","Js 8:1"])
lugar("hebrom","Hebrom (Manre)","Hebrom, Cisjordânia",31.53,35.10,"certo","Onde Abraão habitou junto aos carvalhos de Manre e comprou a caverna de Macpela. Primeira capital de Davi.",["Gn 13:18","Gn 23:19","2Sm 2:1-4"])
lugar("gerar","Gerar","Tell Haror (provável)",31.38,34.61,"provável","Região filisteia onde Abraão e depois Isaque peregrinaram.",["Gn 20:1","Gn 26:1"])
lugar("berseba","Berseba","Tel Sheva, perto de Beersheba",31.24,34.84,"certo","Poço da aliança entre Abraão e Abimeleque; limite sul de Israel (“de Dã a Berseba”).",["Gn 21:31","Gn 26:33","1Rs 4:25"])
lugar("moria","Monte Moriá / Jerusalém","Jerusalém",31.78,35.23,"certo","Abraão foi chamado a oferecer Isaque num dos montes de Moriá; 2 Crônicas identifica Moriá com o monte do templo.",["Gn 22:2","2Cr 3:1"])
lugar("egito","Egito (Mênfis)","Mit Rahina, perto do Cairo",29.85,31.25,"certo","Abrão desceu ao Egito na fome; José foi governador ali; Israel viveu no Egito até o êxodo.",["Gn 12:10","Gn 41:41","Êx 1:1"])
lugar("ramesses","Ramessés","Qantir / Pi-Ramessés, Egito",30.80,31.83,"provável","Cidade-armazém no delta oriental, ponto de partida do êxodo.",["Êx 1:11","Êx 12:37","Nm 33:3"])
lugar("sucote","Sucote","Tell el-Maskhuta (provável)",30.55,32.10,"provável","Primeiro acampamento depois de Ramessés.",["Êx 12:37","Nm 33:5"])
lugar("marvermelho","Travessia do mar","Local debatido",29.95,32.55,"incerto","O texto chama o mar de yam suph (“mar de juncos”/Mar Vermelho). Há várias propostas: lagos Amargos, golfo de Suez ou golfo de Ácaba. O ponto no mapa é ilustrativo.",["Êx 14:21-31","Êx 15:4"])
lugar("mara","Mara","Local incerto (deserto de Sur)",29.6,32.95,"incerto","Águas amargas tornadas doces.",["Êx 15:23-25"])
lugar("elim","Elim","Local incerto",29.2,33.1,"incerto","Doze fontes e setenta palmeiras.",["Êx 15:27","Nm 33:9"])
lugar("sinai","Monte Sinai (Horebe)","Jebel Musa, Egito (tradição)",28.54,33.97,"incerto","Onde Deus deu a Lei a Moisés. A identificação com Jebel Musa remonta a uma tradição cristã do séc. IV; outras propostas incluem montes no norte do Sinai e na Arábia.",["Êx 19:1-20","Êx 20:1-17","1Rs 19:8","Gl 4:25"])
lugar("cades","Cades-Barneia","Ein el-Qudeirat (provável)",30.65,34.42,"provável","Base de Israel no deserto; de lá saíram os doze espias. Israel vagou quase 38 anos até deixar a região.",["Nm 13:26","Nm 20:1","Dt 1:46"])
lugar("nebo","Monte Nebo","Jebel Siyagha, Jordânia",31.77,35.73,"provável","De onde Moisés viu a terra prometida e onde morreu.",["Dt 34:1-5"])
lugar("sitim","Sitim","Tell el-Hammam (debatido)",31.84,35.67,"incerto","Último acampamento de Israel antes de atravessar o Jordão.",["Nm 25:1","Js 2:1","Js 3:1"])
lugar("gilgal","Gilgal","Local incerto perto de Jericó",31.86,35.48,"incerto","Primeiro acampamento em Canaã, com as doze pedras do Jordão.",["Js 4:19-20","Js 5:9","1Sm 11:15"])
lugar("jerico","Jericó","Tell es-Sultan",31.87,35.44,"certo","Uma das cidades mais antigas do mundo; muralhas caíram diante de Israel.",["Js 6:1-27","2Rs 2:4","Lc 19:1-10"])
lugar("gibeom","Gibeom","el-Jib",31.85,35.18,"certo","Os gibeonitas fizeram aliança com Josué; batalha em que o sol se deteve.",["Js 9:3","Js 10:12-13","1Rs 3:4"])
lugar("laquis","Laquis","Tel Lachish",31.56,34.85,"certo","Cidade fortificada de Judá; tomada por Josué e, séculos depois, cercada pelos assírios (701 a.C.).",["Js 10:31-32","2Rs 18:14","Jr 34:7"])
lugar("hazor","Hazor","Tel Hazor",33.02,35.57,"certo","“Cabeça de todos aqueles reinos” no norte; queimada por Josué.",["Js 11:10-11","Jz 4:2","1Rs 9:15"])
lugar("silo","Siló","Khirbet Seilun",32.06,35.29,"certo","Onde o tabernáculo ficou nos dias dos juízes; ali Ana orou e Samuel serviu.",["Js 18:1","1Sm 1:3","Jr 7:12"])
lugar("da","Dã","Tel Dan",33.25,35.65,"certo","Cidade no extremo norte de Israel; Jeroboão pôs ali um bezerro de ouro.",["Jz 18:29","1Rs 12:29"])
lugar("samaria","Samaria","Sebastia, Cisjordânia",32.28,35.20,"certo","Capital do Reino do Norte, fundada por Onri; caiu diante da Assíria em 722 a.C.",["1Rs 16:24","2Rs 17:5-6","At 8:5"])
lugar("jerusalem","Jerusalém","Jerusalém",31.78,35.23,"certo","Cidade de Davi e do templo; centro da história bíblica, da morte e ressurreição de Jesus e do início da igreja.",["2Sm 5:6-9","1Rs 8:1","Lc 24:47","At 2:1-41"])
lugar("ninive","Nínive","Mosul, Iraque",36.36,43.15,"certo","Capital do Império Assírio; Jonas pregou ali. Destruída em 612 a.C.",["Jn 3:3","Na 1:1","2Rs 19:36"])
lugar("assur","Assur","Qal'at Sherqat, Iraque",35.46,43.26,"certo","Antiga capital religiosa da Assíria.",["Gn 10:11"])
lugar("babilonia","Babilônia","Hilla, Iraque",32.54,44.42,"certo","Capital do império de Nabucodonosor; para lá Judá foi levado em cativeiro.",["2Rs 25:1-21","Dn 1:1","Sl 137:1","Ed 1:1"])
lugar("susa","Susã","Shush, Irã",32.19,48.26,"certo","Capital persa onde se passam Ester e o início de Neemias.",["Ne 1:1","Et 1:2","Dn 8:2"])
lugar("damasco","Damasco","Damasco, Síria",33.51,36.29,"certo","Capital dos arameus; na estrada de Damasco Saulo encontrou o Cristo ressuscitado.",["Gn 14:15","2Rs 16:9","At 9:1-25"])
lugar("tiro","Tiro","Tiro (Sur), Líbano",33.27,35.20,"certo","Grande porto fenício; Hirão forneceu cedro para o templo. Paulo passou ali na terceira viagem.",["1Rs 5:1","Ez 27:3","At 21:3-6"])
lugar("sidom","Sidom","Saida, Líbano",33.56,35.37,"certo","Cidade fenícia; parada de Paulo a caminho de Roma.",["Gn 10:15","Mt 15:21","At 27:3"])
lugar("gaza","Gaza","Gaza",31.50,34.47,"certo","Cidade filisteia; caminho de Jerusalém a Gaza foi onde Filipe encontrou o eunuco etíope.",["Jz 16:21","At 8:26"])
lugar("megido","Megido","Tel Megiddo",32.58,35.18,"certo","Fortaleza estratégica no vale de Jezreel.",["Js 12:21","1Rs 9:15","2Rs 23:29"])
lugar("jope","Jope","Jafa, Tel Aviv",32.05,34.75,"certo","Porto onde Jonas embarcou e onde Pedro ressuscitou Tabita e teve a visão do lençol.",["Jn 1:3","At 9:36-43","At 10:5-16"])
# ---------- Novo Testamento: Jesus ----------
lugar("belem","Belém","Belém, Cisjordânia",31.70,35.20,"certo","Cidade de Davi; nascimento de Jesus.",["Mq 5:2","Mt 2:1","Lc 2:4-7"])
lugar("nazare","Nazaré","Nazaré, Israel",32.70,35.30,"certo","Onde Jesus cresceu.",["Lc 2:39-40","Lc 4:16","Mt 2:23"])
lugar("betabara","Betânia além do Jordão","Al-Maghtas (provável), Jordânia",31.84,35.55,"incerto","Onde João batizava e Jesus foi batizado (local exato debatido).",["Jo 1:28","Mt 3:13-17"])
lugar("cana","Caná da Galileia","Khirbet Qana (provável)",32.80,35.30,"incerto","Primeiro sinal de Jesus: a água transformada em vinho.",["Jo 2:1-11","Jo 4:46"])
lugar("cafarnaum","Cafarnaum","Kfar Nahum, Israel",32.88,35.57,"certo","Centro do ministério de Jesus na Galileia; casa de Pedro.",["Mt 4:13","Mc 1:21-34","Mc 2:1"])
lugar("betsaida","Betsaida","et-Tell ou el-Araj (debatido)",32.91,35.63,"provável","Cidade de Pedro, André e Filipe.",["Jo 1:44","Mc 8:22-26","Lc 9:10"])
lugar("magdala","Magdala","Migdal, Israel",32.83,35.52,"provável","Cidade de Maria Madalena.",["Lc 8:2"])
lugar("cesfilipe","Cesareia de Filipe","Banias, Colinas de Golã",33.25,35.69,"certo","Onde Pedro confessou: “Tu és o Cristo”.",["Mt 16:13-20","Mc 8:27-30"])
lugar("sicar","Sicar (poço de Jacó)","perto de Nablus",32.21,35.29,"provável","Conversa de Jesus com a mulher samaritana.",["Jo 4:5-42"])
lugar("betania","Betânia","al-Eizariya, Cisjordânia",31.77,35.26,"certo","Casa de Marta, Maria e Lázaro; local da ressurreição de Lázaro.",["Jo 11:1-44","Mc 14:3","Lc 24:50"])
lugar("emaus","Emaús","Local incerto (várias propostas)",31.84,34.99,"incerto","O Ressuscitado caminhou com dois discípulos.",["Lc 24:13-35"])
# ---------- Igreja primitiva ----------
lugar("cesareia","Cesareia Marítima","Caesarea, Israel",32.50,34.89,"certo","Capital romana da Judeia; conversão de Cornélio; Paulo ficou preso ali dois anos.",["At 10:1-48","At 21:8","At 23:33","At 24:27"])
lugar("lida","Lida","Lod, Israel",31.95,34.89,"certo","Pedro curou Eneias.",["At 9:32-35"])
lugar("azoto","Azoto","Ashdod, Israel",31.80,34.65,"certo","Onde Filipe reapareceu depois do batismo do eunuco.",["At 8:40"])
lugar("antioquia","Antioquia da Síria","Antáquia (Antakya), Turquia",36.20,36.16,"certo","Ali os discípulos foram chamados cristãos pela primeira vez; base das viagens missionárias de Paulo.",["At 11:19-26","At 13:1-3","At 14:26","Gl 2:11"])
lugar("seleucia","Selêucia","Samandağ, Turquia",36.12,35.93,"certo","Porto de Antioquia, de onde partiu a primeira viagem.",["At 13:4"])
lugar("tarso","Tarso","Tarsus, Turquia",36.92,34.89,"certo","Cidade natal de Paulo.",["At 9:11","At 9:30","At 21:39","At 22:3"])
lugar("salamina","Salamina","Salamis, perto de Famagusta, Chipre",35.18,33.90,"certo","Paulo e Barnabé pregaram nas sinagogas.",["At 13:5"])
lugar("pafos","Pafos","Pafos, Chipre",34.76,32.41,"certo","Conversão do procônsul Sérgio Paulo; Elimas ficou cego.",["At 13:6-12"])
lugar("perge","Perge","Perge, perto de Antália, Turquia",36.96,30.85,"certo","João Marcos voltou a Jerusalém daqui.",["At 13:13","At 14:25"])
lugar("atalia","Atália","Antália, Turquia",36.88,30.70,"certo","Porto de onde Paulo e Barnabé voltaram a Antioquia.",["At 14:25-26"])
lugar("antpisidia","Antioquia da Pisídia","Yalvaç, Turquia",38.31,31.19,"certo","Grande sermão de Paulo na sinagoga.",["At 13:14-52","2Tm 3:11"])
lugar("iconio","Icônio","Konya, Turquia",37.87,32.49,"certo","Muitos creram; perseguição obrigou a fuga.",["At 14:1-6","At 16:2"])
lugar("listra","Listra","perto de Hatunsaray, Turquia",37.58,32.45,"provável","Cura de um coxo; Paulo apedrejado; cidade de Timóteo.",["At 14:8-20","At 16:1-2"])
lugar("derbe","Derbe","Kerti Hüyük (provável), Turquia",37.35,33.36,"provável","Muitos discípulos; ponto final da primeira viagem antes do retorno.",["At 14:20-21","At 16:1"])
lugar("troade","Trôade","Alexandria Troas, Turquia",39.75,26.16,"certo","Visão do varão macedônio; ressurreição de Êutico.",["At 16:8-10","At 20:6-12","2Co 2:12"])
lugar("samotracia","Samotrácia","ilha de Samotrácia, Grécia",40.48,25.53,"certo","Escala marítima a caminho da Macedônia.",["At 16:11"])
lugar("neapolis","Neápolis","Kavala, Grécia",40.94,24.41,"certo","Porto de Filipos; primeiro desembarque de Paulo na Europa.",["At 16:11"])
lugar("filipos","Filipos","Filippoi, Grécia",41.01,24.29,"certo","Conversão de Lídia e do carcereiro; Paulo e Silas presos e libertos.",["At 16:12-40","Fp 1:1"])
lugar("anfipolis","Anfípolis","Amfipoli, Grécia",40.82,23.85,"certo","Passagem a caminho de Tessalônica.",["At 17:1"])
lugar("tessalonica","Tessalônica","Tessalônica, Grécia",40.64,22.94,"certo","Igreja formada em poucas semanas; tumulto contra Jasom.",["At 17:1-9","1Ts 1:1"])
lugar("bereia","Bereia","Veria, Grécia",40.52,22.20,"certo","Os bereanos examinavam as Escrituras todos os dias.",["At 17:10-14"])
lugar("atenas","Atenas","Atenas, Grécia",37.97,23.73,"certo","Discurso de Paulo no Areópago.",["At 17:15-34"])
lugar("corinto","Corinto","Antiga Corinto, Grécia",37.91,22.88,"certo","Paulo ficou um ano e meio; Áquila e Priscila; inscrição de Gálio confirma a data (c. 51–52 d.C.).",["At 18:1-18","1Co 1:2","2Co 1:1"])
lugar("cencreia","Cencreia","Kechries, Grécia",37.88,22.99,"certo","Porto oriental de Corinto; igreja de Febe.",["At 18:18","Rm 16:1"])
lugar("efeso","Éfeso","Selçuk, Turquia",37.94,27.34,"certo","Paulo ensinou ali cerca de três anos; tumulto dos ourives; igreja de Apocalipse 2.",["At 18:19","At 19:1-41","At 20:31","Ef 1:1","Ap 2:1"])
lugar("mileto","Mileto","Milet, Turquia",37.53,27.28,"certo","Despedida de Paulo aos presbíteros de Éfeso.",["At 20:15-38","2Tm 4:20"])
lugar("cos","Cós","ilha de Kos, Grécia",36.89,27.29,"certo","Escala marítima.",["At 21:1"])
lugar("rodes","Rodes","ilha de Rodes, Grécia",36.44,28.23,"certo","Escala marítima.",["At 21:1"])
lugar("patara","Pátara","Patara, Turquia",36.26,29.32,"certo","Troca de navio rumo à Fenícia.",["At 21:1-2"])
lugar("ptolemaida","Ptolemaida","Acre (Akko), Israel",32.92,35.07,"certo","Paulo saudou os irmãos por um dia.",["At 21:7"])
lugar("mirra","Mirra","Demre, Turquia",36.26,29.98,"certo","Paulo foi transferido para um navio de Alexandria.",["At 27:5-6"])
lugar("cnido","Cnido","Datça, Turquia",36.69,27.37,"certo","Ventos contrários na viagem a Roma.",["At 27:7"])
lugar("bonsportos","Bons Portos (Creta)","Kaloi Limenes, Creta",34.93,24.81,"provável","Paulo aconselhou passar o inverno ali.",["At 27:8-12"])
lugar("malta","Malta","Malta",35.95,14.40,"certo","Naufrágio; Paulo picado por uma víbora; cura do pai de Públio.",["At 28:1-10"])
lugar("siracusa","Siracusa","Siracusa, Sicília",37.07,15.29,"certo","Três dias de escala.",["At 28:12"])
lugar("regio","Régio","Reggio Calabria, Itália",38.11,15.65,"certo","Escala antes de Putéoli.",["At 28:13"])
lugar("puteoli","Putéoli","Pozzuoli, Itália",40.82,14.12,"certo","Paulo encontrou irmãos e ficou sete dias.",["At 28:13-14"])
lugar("forum","Fórum de Ápio e Três Vendas","Via Ápia, Itália",41.55,12.95,"provável","Irmãos de Roma vieram ao encontro de Paulo.",["At 28:15"])
lugar("roma","Roma","Roma, Itália",41.89,12.49,"certo","Capital do império; Paulo ficou dois anos em casa alugada pregando o Reino. Segundo a tradição, Pedro e Paulo morreram ali sob Nero.",["At 28:16-31","Rm 1:7","2Tm 1:17"])
lugar("patmos","Patmos","ilha de Patmos, Grécia",37.32,26.55,"certo","Onde João recebeu o Apocalipse.",["Ap 1:9"])
lugar("esmirna","Esmirna","Izmir, Turquia",38.42,27.14,"certo","Igreja de Apocalipse 2.",["Ap 2:8"])
lugar("pergamo","Pérgamo","Bergama, Turquia",39.13,27.18,"certo","Igreja de Apocalipse 2.",["Ap 2:12"])
lugar("tiatira","Tiatira","Akhisar, Turquia",38.92,27.84,"certo","Igreja de Apocalipse 2; cidade de Lídia.",["Ap 2:18","At 16:14"])
lugar("sardes","Sardes","Sart, Turquia",38.49,28.04,"certo","Igreja de Apocalipse 3.",["Ap 3:1"])
lugar("filadelfia","Filadélfia","Alaşehir, Turquia",38.35,28.52,"certo","Igreja de Apocalipse 3.",["Ap 3:7"])
lugar("laodiceia","Laodiceia","perto de Denizli, Turquia",37.84,29.11,"certo","Igreja de Apocalipse 3; ligada a Colossos.",["Ap 3:14","Cl 4:16"])
lugar("colossos","Colossos","perto de Honaz, Turquia",37.79,29.26,"provável","Igreja que recebeu a carta aos Colossenses.",["Cl 1:2"])
lugar("alexandria","Alexandria","Alexandria, Egito",31.20,29.92,"certo","Grande centro judaico e cristão; cidade de Apolo.",["At 18:24","At 27:6"])
lugar("patras","Patras","Patras, Grécia",38.25,21.73,"certo","Segundo uma tradição tardia, local do martírio do apóstolo André.",[])
lugar("arabia","Arábia (Nabateia)","região de Petra, Jordânia",30.33,35.44,"incerto","Paulo foi para a Arábia logo após a conversão; a região exata não é dita.",["Gl 1:17"])
lugar("cirene","Cirene","Shahhat, Líbia",32.82,21.86,"certo","Cidade de Simão, que carregou a cruz.",["Mc 15:21","At 11:20"])

# ---------- Jornadas ----------
J = []
def jornada(id, nome, grupo, periodo, livro, pessoas, cor, data, resumo, etapas, nota=""):
    J.append({"id":id,"nome":nome,"grupo":grupo,"periodo":periodo,"livro":livro,"pessoas":pessoas,"cor":cor,"data":data,"resumo":resumo,"nota":nota,
              "etapas":[dict(zip(["p","t","ref","f","nota","rota"],e+(("",)*(6-len(e))))) for e in etapas]})
# rota: "" = trajeto por terra citado; "mar" = trecho marítimo; "aprox" = trajeto aproximado/hipotético

jornada("abraao","A jornada de Abraão","AT","Patriarcas","Gênesis",["Abraão","Sara","Ló","Terá"],"#b8862e","c. 2000–1800 a.C. (cronologia debatida)",
 "De Ur dos caldeus a Canaã: a peregrinação da fé de Abraão, com a promessa da terra e da descendência.",
 [("ur","Partida com Terá","Gn 11:31","B"),("hara","Terá morre; chamado de Deus","Gn 12:1-4","B","",""),
  ("siquem","Promessa da terra e altar","Gn 12:6-7","B","","aprox"),("betel","Altar entre Betel e Ai","Gn 12:8","B"),
  ("egito","Descida ao Egito na fome","Gn 12:10","B","","aprox"),("betel","Volta a Betel","Gn 13:3-4","B","","aprox"),
  ("hebrom","Habita em Manre, Hebrom","Gn 13:18","B"),("gerar","Peregrinação em Gerar","Gn 20:1","B"),("berseba","Aliança do poço","Gn 21:31-33","B"),
  ("moria","Prova em Moriá","Gn 22:1-14","B"),("hebrom","Sara morre; compra de Macpela","Gn 23:1-20","B")],
 "As cidades são citadas no texto; os caminhos entre elas são aproximados.")
jornada("exodo","O êxodo e o deserto","AT","Êxodo e conquista","Êxodo · Números · Deuteronômio",["Moisés","Arão","Miriã"],"#8c2f39","c. 1446 a.C. (datação antiga, 1Rs 6:1) ou c. 1260 a.C. (datação tardia)",
 "A saída do Egito, a travessia do mar, a Lei no Sinai e os quarenta anos no deserto até as campinas de Moabe.",
 [("ramesses","Saída do Egito","Êx 12:37","B"),("sucote","Primeiro acampamento","Êx 12:37","B"),
  ("marvermelho","Travessia do mar","Êx 14:21-31","B","Local debatido; ponto ilustrativo","aprox"),("mara","Águas amargas","Êx 15:23","B","Local incerto","aprox"),
  ("elim","Fontes e palmeiras","Êx 15:27","B","Local incerto","aprox"),("sinai","A Lei no monte Sinai","Êx 19–20","B","Localização tradicional (Jebel Musa); outras hipóteses","aprox"),
  ("cades","Os doze espias","Nm 13:26","B","","aprox"),("nebo","Moisés vê a terra e morre","Dt 34:1-5","B","Rota pelo leste (Edom e Moabe) aproximada","aprox")],
 "O roteiro do êxodo é uma das questões mais debatidas da geografia bíblica. Os pontos intermediários e a rota são reconstruções; apenas a direção geral é segura.")
jornada("conquista","A conquista de Canaã","AT","Êxodo e conquista","Josué",["Josué","Calebe","Raabe"],"#5e4a72","c. 1406–1400 a.C. (datação antiga) ou séc. XIII a.C. (datação tardia)",
 "A travessia do Jordão e as campanhas de Josué no centro, no sul e no norte de Canaã.",
 [("sitim","Acampamento em Sitim","Js 2:1","B"),("gilgal","Travessia do Jordão; Gilgal","Js 3–4","B"),("jerico","Queda de Jericó","Js 6","B"),
  ("ai","Derrota e vitória em Ai","Js 7–8","B"),("siquem","Renovação da aliança (Ebal e Gerizim)","Js 8:30-35","B","","aprox"),
  ("gibeom","Aliança com Gibeom; o sol se detém","Js 9–10","B","","aprox"),("laquis","Campanha do sul","Js 10:31-35","B","","aprox"),
  ("hazor","Campanha do norte: Hazor","Js 11:1-11","B","","aprox"),("silo","O tabernáculo em Siló; partilha da terra","Js 18:1","B","","aprox")])
jornada("exilio","Exílio: Israel e Judá","AT","Reinos, exílio e retorno","2 Reis · Jeremias · Daniel",["Nabucodonosor","Daniel","Ezequiel"],"#3f6c99","722 a.C. (Samaria) · 605, 597 e 586 a.C. (Jerusalém)",
 "O Reino do Norte foi levado pela Assíria; Judá, pela Babilônia, como os profetas haviam anunciado.",
 [("samaria","Queda de Samaria","2Rs 17:5-6","B","Confirmada nos anais de Sargão II (H)"),("ninive","Deportação para a Assíria","2Rs 17:6","B","Destinos: Hala, Habor e cidades dos medos","aprox"),
  ("jerusalem","Cerco e queda de Jerusalém","2Rs 25:1-21","B","Crônicas babilônicas confirmam 597 a.C. (H)"),("babilonia","Cativeiro na Babilônia","Sl 137:1","B","Rota pelo Crescente Fértil, não pelo deserto","aprox")])
jornada("retorno","O retorno a Jerusalém","AT","Reinos, exílio e retorno","Esdras · Neemias · Ageu",["Ciro","Zorobabel","Esdras","Neemias"],"#4f7a63","538 a.C. (Zorobabel) · 458 a.C. (Esdras) · 445 a.C. (Neemias)",
 "Com o decreto de Ciro, os exilados voltam, reconstroem o templo e, depois, os muros de Jerusalém.",
 [("babilonia","Decreto de Ciro","Ed 1:1-4","B","O Cilindro de Ciro (H) mostra a política persa de devolver povos"),("susa","Neemias, copeiro em Susã","Ne 1:1","B"),
  ("jerusalem","Templo e muros reconstruídos","Ed 6:15","B","Rota pelo norte, contornando o deserto","aprox")])
jornada("jesus","O ministério de Jesus","NT","Vida de Jesus","Evangelhos",["Jesus","os Doze"],"#b8862e","c. 6–4 a.C. (nascimento) · c. 27–30 ou 30–33 d.C. (ministério)",
 "Do nascimento em Belém à cruz e à ressurreição em Jerusalém: os principais lugares do ministério de Jesus.",
 [("belem","Nascimento","Lc 2:1-7","B"),("egito","Fuga para o Egito","Mt 2:13-15","B","","aprox"),("nazare","Infância em Nazaré","Mt 2:23","B","","aprox"),
  ("betabara","Batismo no Jordão","Jo 1:28","B","Local exato debatido","aprox"),("cana","Primeiro sinal","Jo 2:1-11","B"),
  ("cafarnaum","Centro do ministério na Galileia","Mt 4:13","B"),("sicar","A mulher samaritana","Jo 4:5-42","B","","aprox"),
  ("betsaida","Cura do cego","Mc 8:22-26","B"),("cesfilipe","Confissão de Pedro","Mt 16:13-20","B"),
  ("jerico","Zaqueu","Lc 19:1-10","B","","aprox"),("betania","Ressurreição de Lázaro","Jo 11:1-44","B"),
  ("jerusalem","Paixão, morte e ressurreição","Lc 23–24","B"),("emaus","Caminho de Emaús","Lc 24:13-35","B","Local incerto","aprox")],
 "A ordem dos acontecimentos na Galileia é simplificada; os Evangelhos não dão um itinerário completo.")
jornada("paulo-conversao","Paulo: conversão e primeiros anos","NT","Igreja primitiva","Atos · Gálatas",["Paulo","Ananias","Barnabé"],"#7a3550","c. 33–46 d.C.",
 "De perseguidor a apóstolo: a estrada de Damasco, a Arábia, Tarso e Antioquia.",
 [("jerusalem","Perseguidor da igreja","At 8:1-3","B"),("damasco","Encontro com Cristo","At 9:1-19","B"),("arabia","Arábia","Gl 1:17","B","Região exata não informada","aprox"),
  ("damasco","Volta a Damasco; fuga pelo muro","At 9:23-25; Gl 1:17","B"),("jerusalem","Visita a Pedro (15 dias)","Gl 1:18","B"),
  ("tarso","Retorno a Tarso","At 9:30","B","","aprox"),("antioquia","Barnabé o leva a Antioquia","At 11:25-26","B","","aprox")])
jornada("paulo1","Paulo: 1ª viagem missionária","NT","Igreja primitiva","Atos 13–14",["Paulo","Barnabé","João Marcos"],"#c0392b","c. 46–48 d.C.",
 "Enviados pela igreja de Antioquia, Paulo e Barnabé levam o evangelho a Chipre e à Galácia do sul.",
 [("antioquia","Enviados pelo Espírito","At 13:1-3","B"),("seleucia","Embarque","At 13:4","B"),("salamina","Pregação nas sinagogas","At 13:5","B","","mar"),
  ("pafos","Sérgio Paulo crê","At 13:6-12","B"),("perge","João Marcos volta","At 13:13","B","","mar"),("antpisidia","Sermão na sinagoga","At 13:14-52","B"),
  ("iconio","Muitos creem; perseguição","At 14:1-6","B"),("listra","Paulo é apedrejado","At 14:8-20","B"),("derbe","Muitos discípulos","At 14:20-21","B"),
  ("listra","Fortalecendo as igrejas","At 14:21-22","B"),("iconio","Presbíteros eleitos","At 14:23","B"),("antpisidia","De volta","At 14:21","B"),
  ("perge","Pregação em Perge","At 14:25","B"),("atalia","Embarque","At 14:25","B"),("antioquia","Relatório à igreja","At 14:26-28","B","","mar")])
jornada("paulo2","Paulo: 2ª viagem missionária","NT","Igreja primitiva","Atos 15:36–18:22",["Paulo","Silas","Timóteo","Lucas"],"#2e86c1","c. 49–52 d.C.",
 "Com Silas e depois Timóteo, Paulo atravessa para a Europa: Filipos, Tessalônica, Bereia, Atenas e Corinto.",
 [("antioquia","Partida com Silas","At 15:40","B"),("tarso","Pela Síria e Cilícia","At 15:41","B","Tarso não é citada; passagem provável","aprox"),
  ("derbe","Derbe","At 16:1","B"),("listra","Timóteo se junta","At 16:1-3","B"),("antpisidia","Pela Frígia e Galácia","At 16:6","B","Rota pela região, aproximada","aprox"),
  ("troade","Visão do macedônio; Lucas se junta (“nós”)","At 16:8-10","B","","aprox"),("samotracia","Escala","At 16:11","B","","mar"),("neapolis","Chegada à Europa","At 16:11","B","","mar"),
  ("filipos","Lídia; prisão e livramento","At 16:12-40","B"),("anfipolis","Passagem","At 17:1","B"),("tessalonica","Igreja formada","At 17:1-9","B"),
  ("bereia","Os bereanos examinam as Escrituras","At 17:10-14","B"),("atenas","Discurso no Areópago","At 17:16-34","B","","mar"),
  ("corinto","Um ano e meio; cartas aos Tessalonicenses","At 18:1-11","B","Data confirmada pela inscrição de Gálio (H)"),
  ("cencreia","Voto de Paulo","At 18:18","B"),("efeso","Breve visita","At 18:19-21","B","","mar"),("cesareia","Desembarque","At 18:22","B","","mar"),
  ("antioquia","Retorno a Antioquia","At 18:22","B","Subida a Jerusalém implícita no texto","aprox")])
jornada("paulo3","Paulo: 3ª viagem missionária","NT","Igreja primitiva","Atos 18:23–21:17",["Paulo","Timóteo","Lucas","Áquila e Priscila"],"#16a085","c. 53–57 d.C.",
 "Quase três anos em Éfeso, visita às igrejas da Macedônia e da Grécia e a viagem final a Jerusalém.",
 [("antioquia","Partida","At 18:23","B"),("antpisidia","Pela Galácia e Frígia","At 18:23","B","Rota aproximada","aprox"),
  ("efeso","Quase três anos em Éfeso","At 19:1-41; At 20:31","B"),("troade","Rumo à Macedônia","2Co 2:12-13","B","","aprox"),
  ("filipos","Macedônia","At 20:1-2","B","","mar"),("corinto","Três meses na Grécia; carta aos Romanos","At 20:2-3","B","Corinto é provável, não citada (Hp)","aprox"),
  ("filipos","Páscoa em Filipos","At 20:6","B","","aprox"),("troade","Êutico","At 20:6-12","B","","mar"),("mileto","Despedida aos presbíteros","At 20:15-38","B","","mar"),
  ("cos","Cós","At 21:1","B","","mar"),("rodes","Rodes","At 21:1","B","","mar"),("patara","Pátara","At 21:1","B","","mar"),("tiro","Tiro","At 21:3-6","B","","mar"),
  ("ptolemaida","Ptolemaida","At 21:7","B","","mar"),("cesareia","Casa de Filipe; profecia de Ágabo","At 21:8-14","B"),("jerusalem","Chegada e prisão","At 21:17-36","B")])
jornada("paulo-roma","Paulo: viagem a Roma","NT","Igreja primitiva","Atos 27–28",["Paulo","Lucas","Aristarco","Júlio, o centurião"],"#d35400","c. 59–60 d.C.",
 "Preso, Paulo apela a César e viaja a Roma: tempestade, naufrágio em Malta e chegada à capital do império.",
 [("cesareia","Embarque como prisioneiro","At 27:1-2","B"),("sidom","Sidom","At 27:3","B","","mar"),("mirra","Troca de navio","At 27:5-6","B","","mar"),
  ("cnido","Ventos contrários","At 27:7","B","","mar"),("bonsportos","Bons Portos","At 27:8","B","","mar"),("malta","Tempestade e naufrágio","At 27:14–28:10","B","Rota exata da deriva é aproximada","aprox"),
  ("siracusa","Siracusa","At 28:12","B","","mar"),("regio","Régio","At 28:13","B","","mar"),("puteoli","Putéoli","At 28:13-14","B","","mar"),
  ("forum","Fórum de Ápio e Três Vendas","At 28:15","B","","aprox"),("roma","Dois anos em Roma","At 28:16-31","B")])
jornada("pedro","Pedro","NT","Igreja primitiva","Evangelhos · Atos · 1 e 2 Pedro",["Pedro","João","Cornélio"],"#8e44ad","c. 30–64/68 d.C.",
 "Do mar da Galileia a Roma: o pescador chamado a ser pescador de homens.",
 [("betsaida","Natural de Betsaida","Jo 1:44","B"),("cafarnaum","Chamado; casa em Cafarnaum","Mc 1:16-18,29","B"),("cesfilipe","“Tu és o Cristo”","Mt 16:16","B"),
  ("jerusalem","Pentecostes e primeiros sermões","At 2:14-41","B"),("samaria","Com João em Samaria","At 8:14-25","B"),("lida","Cura de Eneias","At 9:32-35","B"),
  ("jope","Tabita; visão do lençol","At 9:36–10:16","B"),("cesareia","Casa de Cornélio","At 10:24-48","B"),("jerusalem","Prisão e livramento","At 12:1-17","B"),
  ("antioquia","Confronto com Paulo","Gl 2:11-14","B","","aprox"),("jerusalem","Concílio de Jerusalém","At 15:7-11","B","","aprox"),
  ("roma","Martírio em Roma (tradição)","Jo 21:18-19","T","A presença e a morte de Pedro em Roma sob Nero são atestadas por Clemente de Roma, Inácio, Ireneu e Eusébio (T). “Babilônia” em 1Pe 5:13 costuma ser lida como Roma (Hp). A crucificação de cabeça para baixo vem de escritos posteriores (T).","aprox")],
 "Atos para de narrar a vida de Pedro depois do capítulo 15.")
jornada("filipe","Filipe, o evangelista","NT","Igreja primitiva","Atos 6–8; 21",["Filipe","o eunuco etíope"],"#27ae60","c. 33–57 d.C.",
 "Um dos sete diáconos, levou o evangelho a Samaria e ao eunuco etíope e se estabeleceu em Cesareia.",
 [("jerusalem","Escolhido entre os sete","At 6:5","B"),("samaria","Pregação em Samaria","At 8:5-13","B"),("gaza","Estrada de Gaza: o eunuco etíope","At 8:26-39","B","","aprox"),
  ("azoto","Azoto","At 8:40","B"),("cesareia","Casa em Cesareia; quatro filhas profetisas","At 8:40; 21:8-9","B")],
 "Não confundir com o apóstolo Filipe, um dos Doze.")
jornada("joao","João, o apóstolo","NT","Igreja primitiva","Evangelhos · Atos · Apocalipse",["João","Tiago","Pedro"],"#2c3e50","c. 30–100 d.C.",
 "O discípulo amado: da Galileia a Jerusalém, Samaria, Patmos e, segundo a tradição, Éfeso.",
 [("cafarnaum","Chamado com Tiago","Mc 1:19-20","B"),("jerusalem","Ao pé da cruz; testemunha da ressurreição","Jo 19:26-27; 20:1-10","B"),
  ("samaria","Com Pedro em Samaria","At 8:14","B"),("efeso","Ministério em Éfeso (tradição)","—","T","Ireneu (séc. II) afirma que João viveu em Éfeso até o tempo de Trajano (T).","aprox"),
  ("patmos","Exílio em Patmos; o Apocalipse","Ap 1:9","B"),("efeso","Morte natural em Éfeso (tradição)","—","T","Tradição antiga; não há relato bíblico.","mar")])

# ---------- Mapas temáticos ----------
M = []
def mapa(id,nome,grupo,periodo,livro,resumo,labels,lugares,nota=""):
    M.append({"id":id,"nome":nome,"grupo":grupo,"periodo":periodo,"livro":livro,"resumo":resumo,"labels":[{"t":a,"lat":b,"lon":c,"k":k} for a,b,c,k in labels],"lugares":lugares,"nota":nota})
mapa("tribos","As doze tribos de Israel","AT","Êxodo e conquista","Josué 13–21",
 "A partilha da terra entre as tribos. Os nomes estão na região aproximada de cada herança; as fronteiras exatas são descritas em Josué, mas várias são debatidas.",
 [("Aser",33.0,35.2,"tribo"),("Naftali",33.05,35.5,"tribo"),("Zebulom",32.76,35.28,"tribo"),("Issacar",32.58,35.45,"tribo"),
  ("Manassés",32.35,35.15,"tribo"),("Efraim",32.08,35.25,"tribo"),("Benjamim",31.84,35.32,"tribo"),("Dã",31.85,34.9,"tribo"),
  ("Judá",31.45,35.05,"tribo"),("Simeão",31.2,34.75,"tribo"),("Rúben",31.6,35.8,"tribo"),("Gade",32.1,35.8,"tribo"),("Manassés (leste)",32.8,36.0,"tribo"),("Dã (migração)",33.32,35.62,"tribo")],
 ["siquem","silo","jerusalem","hebrom","berseba","da","gibeom","hazor","megido"],"Fronteiras não desenhadas: aguardam pesquisa cartográfica detalhada.")
mapa("reinos","Os reinos de Israel e Judá","AT","Reinos, exílio e retorno","1 e 2 Reis · 1 e 2 Crônicas",
 "Depois de Salomão (c. 930 a.C.), o reino se divide: Israel ao norte, com capital em Samaria, e Judá ao sul, com capital em Jerusalém.",
 [("ISRAEL (Reino do Norte)",32.45,35.35,"reino"),("JUDÁ (Reino do Sul)",31.55,35.0,"reino"),("FILÍSTIA",31.6,34.45,"povo"),("FENÍCIA",33.45,35.35,"povo"),
  ("ARÃ (Síria)",33.6,36.4,"povo"),("AMOM",31.95,35.95,"povo"),("MOABE",31.35,35.8,"povo"),("EDOM",30.6,35.5,"povo")],
 ["samaria","jerusalem","da","betel","damasco","tiro","sidom","gaza","laquis","megido"])
mapa("imperios","Os grandes impérios","AT","Reinos, exílio e retorno","Reis · Daniel · Esdras · Ester",
 "Egito, Assíria, Babilônia e Pérsia dominaram sucessivamente o Oriente Próximo e moldaram a história de Israel.",
 [("EGITO",28.0,31.0,"imperio"),("ASSÍRIA",36.4,43.6,"imperio"),("BABILÔNIA",32.2,45.0,"imperio"),("PÉRSIA (Elão)",31.6,49.4,"imperio"),("MEDIA",35.6,48.2,"imperio")],
 ["egito","ninive","assur","babilonia","susa","jerusalem","damasco","hara","ur"])
mapa("igrejas","As sete igrejas do Apocalipse","NT","Igreja primitiva","Apocalipse 2–3",
 "As sete igrejas da Ásia que receberam as cartas de Cristo em Apocalipse 2 e 3, e a ilha de Patmos.",
 [("ÁSIA (província romana)",38.6,28.9,"regiao")],["efeso","esmirna","pergamo","tiatira","sardes","filadelfia","laodiceia","patmos","colossos"])
mapa("igreja-expansao","A expansão da igreja em Atos","NT","Igreja primitiva","Atos 1:8",
 "“Sereis minhas testemunhas tanto em Jerusalém como em toda a Judeia e Samaria e até os confins da terra” (At 1:8).",
 [("JUDEIA",31.6,35.1,"regiao"),("SAMARIA",32.25,35.25,"regiao"),("GALILEIA",32.8,35.4,"regiao"),("SÍRIA",35.2,37.2,"regiao"),("CILÍCIA",37.0,35.0,"regiao"),
  ("GALÁCIA",39.3,32.6,"regiao"),("ÁSIA",38.6,28.4,"regiao"),("MACEDÔNIA",40.9,22.6,"regiao"),("ACAIA",37.8,22.3,"regiao"),("ITÁLIA",41.2,14.8,"regiao")],
 ["jerusalem","samaria","cesareia","damasco","antioquia","tarso","efeso","filipos","tessalonica","corinto","atenas","roma","alexandria","cirene"])

# ---------- Perfis ----------
F = []
def perfil(id,nome,papel,cor,resumo,secoes,jornadas=(),lugares=()):
    F.append({"id":id,"nome":nome,"papel":papel,"cor":cor,"resumo":resumo,"jornadas":list(jornadas),"lugares":list(lugares),
              "secoes":[{"t":t,"itens":[dict(zip(["x","f","ref"],i)) for i in its]} for t,its in secoes]})
CH,ET,VI,PR,UL="Chamado e início","Principais etapas e regiões","Viagens, companheiros e comunidades","Pregações, acontecimentos e cartas","Últimos registros, prisão e morte"
perfil("paulo","Paulo (Saulo de Tarso)","Apóstolo aos gentios","#c0392b","Fariseu de Tarso, perseguidor da igreja, chamado pelo Cristo ressuscitado para levar o evangelho às nações.",[
 (CH,[("Nascido em Tarso, cidadão romano, educado em Jerusalém aos pés de Gamaliel.","B","At 22:3,28"),("Perseguia a igreja; consentiu na morte de Estêvão.","B","At 7:58–8:3"),("Encontro com Cristo no caminho de Damasco e batismo por Ananias.","B","At 9:1-19")]),
 (ET,[("Arábia, Damasco, Jerusalém, Tarso e Antioquia nos primeiros anos.","B","Gl 1:17-21; At 11:25-26"),("Três viagens missionárias por Chipre, Galácia, Macedônia, Acaia e Ásia.","B","At 13–21"),("Quase três anos em Éfeso.","B","At 20:31")]),
 (VI,[("Companheiros: Barnabé, João Marcos, Silas, Timóteo, Lucas, Tito, Áquila e Priscila.","B","At 13:2; 15:40; 16:1-3,10; Gl 2:1; At 18:2"),("Igrejas plantadas ou fortalecidas em Antioquia da Pisídia, Icônio, Listra, Derbe, Filipos, Tessalônica, Bereia, Corinto e Éfeso.","B","At 13–19")]),
 (PR,[("Sermões em Antioquia da Pisídia, Listra, no Areópago e em Mileto.","B","At 13:16-41; 14:15-17; 17:22-31; 20:18-35"),("Treze cartas do Novo Testamento trazem o seu nome.","B","Rm 1:1"),("Data da estadia em Corinto confirmada pela inscrição de Gálio em Delfos (c. 51–52 d.C.).","H","At 18:12")]),
 (UL,[("Preso em Jerusalém, dois anos em Cesareia, apelo a César e viagem a Roma.","B","At 21–28"),("Dois anos em prisão domiciliar em Roma, pregando o Reino.","B","At 28:30-31"),
      ("Nova prisão e expectativa de morte em 2 Timóteo.","B","2Tm 4:6-8"),("Possível viagem à Espanha: Paulo planejou (Rm 15:24); Clemente de Roma fala que chegou “ao limite do Ocidente” — interpretação debatida.","Hp","Rm 15:24"),
      ("Martírio em Roma sob Nero, por decapitação, c. 64–67 d.C.","T","Eusébio, HE 2.25")])],
 ["paulo-conversao","paulo1","paulo2","paulo3","paulo-roma"])
perfil("pedro","Pedro (Simão)","Apóstolo, um dos Doze","#8e44ad","Pescador da Galileia, chamado por Jesus, porta-voz dos Doze e uma das colunas da igreja de Jerusalém.",[
 (CH,[("Natural de Betsaida; morava em Cafarnaum; levado a Jesus por André.","B","Jo 1:40-44; Mc 1:29"),("Chamado à beira do mar: “pescadores de homens”.","B","Mc 1:16-18")]),
 (ET,[("Confissão em Cesareia de Filipe; negação e restauração.","B","Mt 16:16; Jo 21:15-19"),("Liderança em Jerusalém após o Pentecostes.","B","At 2–5")]),
 (VI,[("Com João em Samaria; Lida, Jope e Cesareia (Cornélio).","B","At 8:14; 9:32–10:48"),("Antioquia, onde foi confrontado por Paulo.","B","Gl 2:11")]),
 (PR,[("Sermão de Pentecostes; discurso no Concílio de Jerusalém.","B","At 2:14-41; 15:7-11"),("Duas cartas trazem o seu nome.","B","1Pe 1:1; 2Pe 1:1")]),
 (UL,[("Jesus indicou o modo da sua morte.","B","Jo 21:18-19"),("Presença e martírio em Roma sob Nero (c. 64–68 d.C.).","T","1 Clemente 5; Eusébio, HE 2.25"),("Crucificado de cabeça para baixo — relato de escritos posteriores.","T","Atos de Pedro (apócrifo, séc. II)")])],["pedro"])
perfil("joao","João, filho de Zebedeu","Apóstolo, um dos Doze","#2c3e50","Pescador, irmão de Tiago, chamado “filho do trovão” e identificado pela tradição como o discípulo amado.",[
 (CH,[("Chamado com Tiago enquanto consertavam as redes.","B","Mc 1:19-20")]),
 (ET,[("Presente na transfiguração, no Getsêmani e ao pé da cruz.","B","Mc 9:2; Mc 14:33; Jo 19:26-27"),("Coluna da igreja de Jerusalém, com Pedro e Tiago.","B","Gl 2:9")]),
 (VI,[("Com Pedro no templo e em Samaria.","B","At 3:1; 8:14")]),
 (PR,[("O Evangelho de João, três cartas e o Apocalipse são tradicionalmente atribuídos a ele.","T","Ireneu, Contra as Heresias 3.1.1"),("Recebeu o Apocalipse na ilha de Patmos.","B","Ap 1:9")]),
 (UL,[("Viveu em Éfeso até idade avançada e morreu de morte natural.","T","Ireneu; Eusébio, HE 3.23")])],["joao"])
perfil("tiago-zebedeu","Tiago, filho de Zebedeu","Apóstolo, um dos Doze","#34495e","Irmão de João, do círculo mais próximo de Jesus e primeiro dos Doze a morrer por Cristo.",[
 (CH,[("Chamado com o irmão João.","B","Mc 1:19-20")]),(ET,[("Presente na transfiguração e no Getsêmani.","B","Mc 9:2; 14:33")]),
 (UL,[("Morto à espada por Herodes Agripa I em Jerusalém, c. 44 d.C.","B","At 12:1-2"),("Tradições sobre pregação na Espanha surgem séculos depois e não têm apoio antigo.","T","—")])],[],["jerusalem"])
perfil("andre","André","Apóstolo, um dos Doze","#16a085","Irmão de Pedro, discípulo de João Batista, foi quem levou Simão a Jesus.",[
 (CH,[("Discípulo de João Batista; seguiu Jesus e chamou o irmão.","B","Jo 1:35-42")]),(ET,[("Apresentou o menino dos pães e os gregos a Jesus.","B","Jo 6:8-9; 12:20-22")]),
 (UL,[("Pregação na Cítia (região do mar Negro), segundo Orígenes citado por Eusébio.","T","Eusébio, HE 3.1"),("Martírio em Patras, na Acaia; a cruz em X é tradição medieval.","T","Atos de André (apócrifo)")])],[],["betsaida","patras"])
perfil("filipe-ap","Filipe, o apóstolo","Apóstolo, um dos Doze","#d4ac0d","Natural de Betsaida, chamou Natanael a Jesus.",[
 (CH,[("Chamado por Jesus na Galileia; levou Natanael.","B","Jo 1:43-46")]),(ET,[("“Senhor, mostra-nos o Pai.”","B","Jo 14:8-9")]),
 (UL,[("Morte em Hierápolis, na Ásia, segundo Polícrates de Éfeso.","T","Eusébio, HE 3.31"),("As fontes antigas às vezes o confundem com Filipe, o evangelista.","Hp","—")])],[],["betsaida"])
perfil("tome","Tomé (Dídimo)","Apóstolo, um dos Doze","#a04000","Conhecido pela dúvida e pela confissão “Senhor meu e Deus meu”.",[
 (ET,[("“Vamos também nós, para morrermos com ele.”","B","Jo 11:16"),("Confissão diante do Ressuscitado.","B","Jo 20:24-29")]),
 (UL,[("Pregação na Pártia, segundo Orígenes.","T","Eusébio, HE 3.1"),("Missão e martírio na Índia (Mylapore), tradição registrada nos Atos de Tomé (séc. III) e preservada pelos cristãos de São Tomé. Fora da área deste mapa.","T","Atos de Tomé")])])
perfil("mateus","Mateus (Levi)","Apóstolo, um dos Doze","#7d6608","Coletor de impostos em Cafarnaum chamado por Jesus.",[
 (CH,[("Chamado na coletoria.","B","Mt 9:9; Mc 2:14")]),(PR,[("O primeiro Evangelho é atribuído a ele desde Papias (séc. II).","T","Eusébio, HE 3.39")]),
 (UL,[("As tradições sobre o lugar da sua morte divergem (Etiópia, Pártia, Pérsia); não há certeza.","T","—")])],[],["cafarnaum"])
perfil("barnabe","Barnabé (José)","Apóstolo e missionário","#117864","Levita de Chipre, “filho da consolação”, que apresentou Paulo aos apóstolos e o acompanhou na primeira viagem.",[
 (CH,[("Natural de Chipre; vendeu um campo e entregou aos apóstolos.","B","At 4:36-37")]),(ET,[("Apresentou Paulo em Jerusalém; enviado a Antioquia.","B","At 9:27; 11:22-26")]),
 (VI,[("Primeira viagem com Paulo; chamado apóstolo.","B","At 13–14; 14:14"),("Separou-se de Paulo por causa de Marcos e foi a Chipre.","B","At 15:36-39")]),
 (UL,[("Martírio em Salamina, Chipre — tradição tardia.","T","Atos de Barnabé (séc. V)")])],["paulo1"])
perfil("silas","Silas (Silvano)","Profeta e companheiro de Paulo","#1f618d","Líder da igreja de Jerusalém escolhido por Paulo para a segunda viagem.",[
 (CH,[("Um dos homens de liderança enviados com a carta do concílio.","B","At 15:22,32")]),(VI,[("Segunda viagem: preso com Paulo em Filipos; Tessalônica, Bereia e Corinto.","B","At 15:40–18:5")]),
 (PR,[("Coautor nas saudações de 1 e 2 Tessalonicenses; secretário ou portador de 1 Pedro.","B","1Ts 1:1; 1Pe 5:12")]),(UL,[("Não há registro bíblico do fim da sua vida.","Hp","—")])],["paulo2"])
perfil("timoteo","Timóteo","Colaborador de Paulo e pastor","#5b2c6f","Jovem de Listra, filho de mãe judia crente e pai grego, tornou-se o filho na fé de Paulo.",[
 (CH,[("Discípulo de Listra; mãe Eunice e avó Loide.","B","At 16:1-3; 2Tm 1:5")]),(VI,[("Segunda e terceira viagens; enviado a Tessalônica, Corinto e Filipos.","B","1Ts 3:2; 1Co 4:17; Fp 2:19")]),
 (PR,[("Coautor nas saudações de várias cartas; destinatário de 1 e 2 Timóteo.","B","2Co 1:1; 1Tm 1:2")]),(ET,[("Deixado em Éfeso para cuidar da igreja.","B","1Tm 1:3")]),
 (UL,[("Foi preso e libertado.","B","Hb 13:23"),("Primeiro bispo de Éfeso e mártir — tradição.","T","Eusébio, HE 3.4")])],["paulo2","paulo3"])
perfil("lucas","Lucas","Médico e companheiro de Paulo","#1e8449","O “médico amado”, autor tradicional do Evangelho de Lucas e de Atos.",[
 (CH,[("Une-se a Paulo em Trôade: começam os trechos em “nós”.","B","At 16:10")]),(VI,[("Filipos; viagem a Jerusalém; viagem a Roma.","B","At 16:10-17; 20:5–21:18; 27:1–28:16")]),
 (PR,[("Autoria de Lucas e Atos: tradição antiga e amplamente aceita.","T","Ireneu, Contra as Heresias 3.1.1")]),
 (UL,[("Com Paulo em Roma: “Só Lucas está comigo”.","B","2Tm 4:11; Cl 4:14"),("Morte aos 84 anos na Beócia — tradição incerta.","T","Prólogo antimarcionita")])],["paulo2","paulo3","paulo-roma"])
perfil("filipe-ev","Filipe, o evangelista","Diácono e evangelista","#27ae60","Um dos sete escolhidos em Atos 6; levou o evangelho a Samaria e ao eunuco etíope.",[
 (CH,[("Escolhido entre os sete.","B","At 6:5")]),(VI,[("Samaria, estrada de Gaza, Azoto e Cesareia.","B","At 8:5-40")]),(UL,[("Morava em Cesareia com quatro filhas profetisas quando Paulo passou.","B","At 21:8-9")])],["filipe"])

data={"lugares":L,"jornadas":J,"mapas":M,"perfis":F,
 "fontes":{"B":"Relato bíblico","H":"Evidência histórica ou arqueológica","T":"Tradição cristã antiga","Hp":"Hipótese ou reconstrução"},
 "creditos":"Contornos: Natural Earth (domínio público). Coordenadas aproximadas a partir de identificações arqueológicas amplamente aceitas. Mapas originais do SOLA | Bíblia & Teologia.",
 "pendencias":["Catálogo de mapas da Bíblia de Estudo de referência: lista detalhada dos mapas não está publicada; conferir com o exemplar impresso.","Uso dos mapas da Bíblia de Estudo da Fé Reformada (Ligonier/Fiel): sem autorização; não incorporados.","Fronteiras das tribos e dos reinos: desenhar polígonos com base em Josué 13–21 e atlas acadêmicos.","Demais apóstolos (Bartolomeu, Tiago de Alfeu, Tadeu, Simão Zelote, Matias): tradições divergentes; perfis a pesquisar.","Jornadas de Davi, Elias e Eliseu, e reinos de Saul, Davi e Salomão.","Revisão das coordenadas de locais incertos (Emaús, Caná, Ai, Sinai, Betânia além do Jordão)."]}
json.dump(data,open('/home/claude/concordancia-biblica/mapas/dados.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(L),len(J),len(M),len(F))
missing=[e['p'] for j in J for e in j['etapas'] if e['p'] not in L]+[p for m in M for p in m['lugares'] if p not in L]
print("missing",missing)
