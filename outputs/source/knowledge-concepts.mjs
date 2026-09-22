// Human-authored functional relationships. Product applications are transfer examples, not qualified reuse.
const application=(industry,object,transfer,recompute,reject)=>({industry,object,transfer,recompute,reject,authority:'AUTHOR_TRANSFER_EXAMPLE_NOT_QUALIFIED_REUSE'});
export const functions=[
 {id:'motion',title:'控制動作',purpose:'決定哪裡能動、怎麼動、到哪裡停止。',flows:['位置','速度','行程']},
 {id:'join',title:'結合與定位',purpose:'讓不同材料及零件在正確位置保持關係，並決定如何拆卸。',flows:['接觸','拘束','裝配順序']},
 {id:'support',title:'支承與傳力',purpose:'把外力沿可辨認的接面傳到宿主，避免用外觀假定承載。',flows:['力','力矩','變形']},
 {id:'protect',title:'包覆與隔離',purpose:'定義內外邊界，處理污染、接觸、磨耗及可達性。',flows:['物質邊界','維修通路']},
 {id:'transport',title:'引導物質與能量',purpose:'建立有起點、終點和連續截面的通道。',flows:['流體','熱','電']},
 {id:'communicate',title:'感知與表達',purpose:'把光、訊號和觸覺轉成可辨認的資訊。',flows:['光','訊號','操作回饋']},
 {id:'form',title:'形成外形與表面',purpose:'由剖面、路徑、厚度、分枝與製程產生可讀形體。',flows:['形狀','材料分區','表面反射']}
];
const M=(id,title,functionIds,purpose,input,output,chain,partRoles,ruleIds,applications,decision)=>({id,title,functionIds,purpose,input,output,chain,partRoles:partRoles.map(([role,shape,why,interfaces,fail])=>({role,shape,why,interfaces,fail})),ruleIds,applications,decision});
export const mechanisms=[
M('hinge','單軸轉動與鉸鏈',['motion','join','support'],'讓兩個宿主繞共同軸相對轉動，並保持徑向定位及軸向不脫落。','固定宿主、活動宿主、轉軸、角度範圍、載荷和開蓋空間','有界轉動與可追查的固定／止退關係',['宿主固定面','固定葉與接座','銷／筒節','活動葉','蓋板'],[
 ['葉片','帶安裝孔的板與筒節','把宿主載荷引到軸孔','板面、安裝孔、筒孔','只有筒節開孔，合併葉板仍侵入銷孔'],['銷','分段圓柱','提供共同轉軸','軸面對筒孔','同軸但沒有軸向保持'],['止退組','套筒與端帽或擋圈','限制軸向退出，同時保留指定間隙','軸端、槽、端面','把止退件鎖死到活動葉，轉動自由度消失']
],['constraints','rigid','clearance','distance','load','helix'],[
 application('家具','櫃門、箱蓋','共同軸與固定／活動葉分工','門重、重心、開啟角、安裝基材、螺絲拔出','不能把車內塑膠接座的螺牙深度直接用在木板'),application('工業設備','設備維修門','可拆銷與軸向保持','振動、污染、門重、維修工具空間','不能把離散無交穿當作防墜驗證'),application('電子產品','筆電上蓋','固定端與旋轉端的宿主關係','保持力矩、排線彎曲、循環磨耗','自由鉸鏈沒有自動具備停角保持能力'),application('建築','檢修口、窗扇','轉動約束與介面分工','戶外腐蝕、風載及玻璃／框架接合','不能沿用小鉸鏈尺寸放大而省略承載設計')
],'先問需要自由轉動、停角、阻尼或回位；這四種功能不是同一個鉸鏈。'),
M('linear','直線導向與滑動',['motion','support'],'限制橫向自由度，留下指定方向的行程。','路徑、滑動件、導向截面、行程與偏載','可定位的平移',['固定軌','滾動／滑動接觸','移動座','工作物'],[['導軌','長截面或雙軌','提供方向與抗側偏','軌面、滑塊、固定面','只畫兩條平行線而沒有包容接觸'],['止擋','端部接收面','限制末端退出','滑塊端面','行程動畫超出真實軌道']],[ 'extrude','constraints','distance','uncertainty','load'],[
application('家具','抽屜滑軌','導向、承托、限位','抽屜載荷、偏心、拉出長度','不能把座椅滑軌鎖止功能當作抽屜阻尼'),application('製造','量測台、滑動治具','座標與導軌介面','直線度、預壓、摩擦與精度','外觀平行不代表運動精度'),application('車輛','車窗升降與座椅移動','有限行程及宿主連接','夾持、玻璃軌跡、線束／拉索','直線公式不能替代彎曲玻璃的實際導向')
],'確認單軌是否足以抗轉；兩軌要檢查過拘束與相互偏差。'),
M('fastener','可拆緊固與夾持',['join','support'],'透過接收螺紋與承壓面，把零件夾持在一起。','板厚、接面、孔位、螺紋、工具與工況','有明確鎖付及反向拆卸入口的接合',['螺絲頭','墊圈／承壓面','被夾件','螺紋接收體'],[['螺絲','螺旋外表面＋頭部凹穴','轉動換成軸向進給與夾持','牙型、節距、承壓面','只碰到表面沒有接收螺紋'],['接收體','螺帽或有底螺孔','承接螺牙反力','內牙、接合長、孔底','尖端先碰孔底，頭部仍未夾緊'],['墊圈','有孔薄環','分配承壓與保護接面','上下承壓面','平墊圈被誤認為可靠防鬆機構']],[ 'helix','polygon','clearance','uncertainty','load'],[
application('機械','馬達座、治具','螺紋與承壓閉合路徑','預緊、交變載荷、材料、潤滑、扭矩','M3外形一致不代表同強度或扭矩'),application('電子產品','機殼及電路板支架','可拆接合與工具通道','絕緣、接地、板彎曲與元件避讓','金屬接觸不能自動視為合格接地'),application('家具','五金接頭','鎖付順序與承壓面','基材蠕變、木紋、拔出及嵌件','不能把金屬攻牙規則直接套到木材')
],'螺紋幾何、夾持力、扭矩與防鬆要分別取得證據。'),
M('bearing','軸的支承與低摩擦旋轉',['motion','support'],'在承接指定方向載荷的同時允許旋轉。','軸、殼孔、載荷方向、轉速、潤滑與定位','受支承的轉軸',['軸','內側接觸','滑動層或滾動體','外側接觸','殼體'],[['軸套','中空圓柱','滑動支承並隔開材料接觸','內孔、外圓、端面','只符合直徑而未處理潤滑或端面摩擦'],['滾動軸承','內外滾道、滾動體與保持架','以不同接觸關係支承旋轉','滾道、保持架、定位肩','把鋼珠排列視為載荷能力證明']],[ 'revolve','circle','clearance','load','uncertainty'],[
application('機械','風扇與馬達轉子','軸／座／定位肩分工','轉速、配合、潤滑、熱伸長與壽命','不能把自由鉸鏈套筒當高速軸承'),application('物流','腳輪、輸送滾筒','輪與固定軸相對旋轉','徑向和軸向載荷、污染、衝擊','加大球數不能代替接觸壓力分析'),application('家電','攪拌與轉動支承','可拆定位與密封分工','介質、溫度、清洗與密封','一般展示形體不能直接作食品接觸件')
],'先分清滑動支承、滾動支承，以及軸向載荷由誰承擔。'),
M('spacing','承壓、補隙與間隔',['join','support'],'用有限厚度的材料建立端面位置，分開補隙、支距及承壓用途。','目標間距、接面高度、孔軸與材料','指定層序與接觸面',['宿主面','墊片／間隔套','被支承面'],[['墊片','薄片／薄環','補平行面的軸向間隙','上下接面','把空隙記成0卻沒有實體補片'],['間隔套','有孔圓柱','維持兩件的距離並傳遞壓力','兩端面與穿孔','外殼已相碰卻宣稱由套筒承壓']],['profile','extrude','revolve','offset','uncertainty'],[
application('電子產品','電路板支柱','分離板面高度與通孔','絕緣、接地、板厚、組裝公差','用金屬支柱前要重新判斷電氣要求'),application('機械','軸承定位套','端面堆疊控制軸向位置','預緊、熱膨脹、端面平行度','有間隔套不代表預緊量已正確'),application('建築','幕牆玻璃墊塊','接觸位置與支距','材料相容、長期壓縮、排水及邊距','不能把金屬薄片直接用作玻璃承托')
],'相同環形，可能是墊圈、定位套或密封；先以作用分類，再以形狀找件。'),
M('retention','止退、鎖止與可釋放保持',['join','motion'],'阻止不希望的退出或運動，同時保留必要自由度及釋放路徑。','可退出方向、接收槽、預定行程、釋放工具','保持與釋放兩種狀態',['被保持件','擋肩／槽','保持件','宿主'],[['擋圈／端帽','開口環或有頭端件','軸向保持','槽側壁、端面','槽有畫出來但保持件無法進槽'],['扣鎖','鉤、舌、接收口','切換鎖住與釋放狀態','卡入面、保持面、釋放路徑','只驗閉合位置，不查退出與誤觸']],[ 'constraints','distance','clearance','elastic','load'],[
application('工具','快拆銷、工具箱扣','保持和釋放分開定義','磨耗、誤操作、釋放力','自由端帽不能直接代替防掉安全銷'),application('家具','抽屜防脫','行程末端保持','滿載衝擊、拆卸入口','止擋存在不代表接收板不會破壞'),application('電子產品','連接器卡扣','卡入、保持、釋放三個面','塑膠撓度、循環和插拔力','幾何重疊不能當成彈性卡入')
],'先寫「允許什麼、禁止什麼、怎麼解除」，才選保持形狀。'),
M('spring','回位、儲能與隔振',['motion','support'],'在指定變形範圍儲存並釋放能量，或改變動態回應。','材料曲線、工作形變、端點拘束與循環','力－位移或力矩－角度關係',['輸入端','彈性材料','固定／移動端'],[['彈簧','線材、薄片、扭桿或彈性體','提供可預期的回復','端腳、支點、預壓','把螺旋外形直接當成正確彈簧模型'],['阻尼件','受控耗能材料／流道','降低振動或關閉速度','速度、耗能與溫度','阻尼與回位彈簧混為同一作用']],[ 'helix','sweep','elastic','load','distance'],[
application('家具','緩衝蓋、回位把手','回復與阻尼分工','手感、夾傷風險、循環和溫度','線性彈簧公式不涵蓋任意大形變'),application('機械','設備隔振座','材料與拘束共同決定動態','頻率、質量、阻尼、靜壓縮','柔軟不代表所有頻率都隔振'),application('車輛','把手回位、座椅彈片','端腳接觸及預壓','疲勞、腐蝕、溫度','外觀金屬色不能指定彈性模數')
],'力矩剛度與直線剛度單位不同；先確認受彎、受扭或壓縮模型。'),
M('seal','密封與環境隔離',['protect','join'],'在兩個宿主的接觸周界限制介質穿越。','介質、壓差、溫度、表面、壓縮及運動','連續密封路徑',['第一接面','可變形密封體','第二接面','保持／壓緊'],[['密封圈／唇','閉環截面掃掠','形成連續接觸帶','壓縮方向、槽、接觸面','只畫環而未對實際接面'],['刮條','帶唇長截面','沿運動表面擦拭','滑動面與排出方向','擦拭條被當成壓力密封']],[ 'profile','sweep','offset','elastic','clearance'],[
application('建築','門窗周界','閉合周界與接觸','雨水路徑、老化、安裝偏差','看起來沒有縫不代表水密'),application('家電','容器蓋與泵介面','壓縮方向及接收槽','介質、清潔、壓差和材料相容','不能照搬汽車橡膠名稱'),application('電子產品','戶外盒體','密封與螺絲夾持分工','壓縮均勻性、洩漏測試','幾何合上不能代替防護等級測試')
],'先確定要隔離哪種介質及什麼工況，才選截面和材料。'),
M('shell','容納、包覆與薄殼',['protect','form'],'建立有厚度的內外界線，保留工作空間、開口和維修入口。','外形、內部元件、壁厚、開口與製程','有內腔及接收面的殼體',['外皮','壁厚／肋','介面','內部物件'],[['外殼','放樣／旋轉／掃掠的內外曲面','包覆與保護','開口、翻邊、固定座','用實心塊遮住應有空腔'],['肋／接座','依載荷與製程形成局部材料','支撐介面','根部過渡、壁厚','接座漂浮或孔穿出殼邊']],[ 'loft','revolve','offset','set','topology','curvature'],[
application('包裝','瓶罐與盒體','開口、底部與壁厚','成形、堆疊、運輸、材料相容','展示杯不能直接作壓力容器'),application('電子產品','儀表與螢幕外殼','內腔、接座與分層','元件散熱、絕緣和拆卸','殼體形狀不能證明電路可運作'),application('家具','椅背殼與燈罩','連續曲面與孔口','局部受力、固定與觸感','薄外殼不自動具有結構支承能力')
],'外形與內腔同時生成；打孔作用於完整材料，不只表面貼黑圓。'),
M('frame','骨架、樑柱與受力路徑',['support','join'],'把分散載荷經構件與接頭傳遞到支承。','載荷、支承、跨度、截面、材料及接合','可追查的力與變形路徑',['面板／工作物','次骨架','主樑柱','接頭','基礎或宿主'],[['樑／柱','實心或薄壁截面沿軸延伸','抗彎、壓縮或其他指定載荷','端部支承與接頭','只給粗樑卻沒有端部傳力'],['加勁與接合板','帶孔板／肋','傳遞局部反力及限制變形','螺栓群、焊接或其他接面','螺栓放在空中而無宿主']],[ 'extrude','profile','load','elastic','uncertainty'],[
application('建築','廠房鋼架','主次構件與支承路徑','實際荷載、穩定、接頭與規範','不能把展示模型當結構設計'),application('家具','桌架、座椅骨架','載荷經接頭傳遞','人體工況、偏載、接頭疲勞','增加厚度不等於所有失效都消失'),application('製造','工作台與定位架','宿主、支撐與可達性','剛度、振動、精度及裝配','視覺水平不能證明量測平臺平面度')
],'先畫完整受力路徑再選截面；截面相似不代表邊界條件相同。'),
M('channel','管路、風道與流體通路',['transport','protect'],'提供連續的內部通路，同時處理支承、接頭與排出。','入口／出口、流量、介質、路徑、截面與工況','可連接、可排出且有宿主的通路',['來源','入口介面','通道','控制／分流','出口'],[['彎管／風道','閉合截面沿路徑掃掠','引導流體','接頭、內腔、彎曲半徑','外表連接但內腔被封死'],['支夾','包容截面與固定座','保持路徑並允許必要位移','外壁、宿主與熱伸長','線管漂浮或運動後拉斷']],[ 'sweep','frame','profile','distance','offset'],[
application('建築','空調風管與排水','連續通路與支承','流量、壓損、坡度、清理及凝結水','只憑管徑不能推出流量'),application('家電','冷卻及排液','接頭和密封分工','溫度、泵、介質、排氣','相似形狀不保證相似流動'),application('車輛','座艙風道','出風口與導管匹配','噪音、流量、熱舒適及管線避讓','後方有洞不代表已連接HVAC')
],'幾何連通、流動性能和密封分開查；本庫形體教材不代替流體求解。'),
M('optical','光學層、顯示與資訊',['communicate','protect'],'把光與影像通過指定光學層交給觀看者。','發光來源、光路、層序、視角、訊號與電源','可看見且可辨識的輸出',['光／訊號來源','調制／導光','擴散與反射','保護層','觀察者'],[['光學層','薄片、透鏡、導光體','按角色改變光路','厚度、空氣隙、支撐與表面','所有透明件共用一種玻璃材質'],['背光與顯示單元','發光件與分層板','光源和影像調制分工','熱、電、光介面','貼一張圖就稱電氣功能完成']],[ 'offset','projection','normals','curvature','uncertainty'],[
application('電子產品','螢幕與儀表','材料層及固定框分工','光學均勻、訊號、觸控、熱與EMC','外觀顯示不能代表硬體功能'),application('照明','燈具、燈罩','光源、反射、擴散與殼體','光通量、眩光、溫升','金屬反射貼圖不是光學模擬'),application('展示','導覽與告示','資訊、視角與可讀性','字級、對比、觀距、環境照明','只放大照片不能保證教學可讀')
],'薄片能建模不表示光學或電子作用已驗證；逐層寫明角色。'),
M('electrical','導體、絕緣與連接',['transport','communicate','protect'],'在指定端子間傳遞電能或訊號，同時保持絕緣及機械支承。','端點、電氣需求、導體、絕緣、路徑及運動','有端點的線路與可拆介面',['端子A','導體','絕緣層','接收器','端子B'],[['導線／排線','路徑掃掠或薄層條帶','連接兩端點','端頭、彎曲、固定夾','只畫橙色線而沒有接頭'],['接收器','外殼、接觸件與保持','定位、導電與防脫分工','接觸面、間距、插入方向','外殼對齊即推定電連通']],[ 'sweep','offset','distance','constraints','units'],[
application('電子產品','螢幕排線','分層、端點與彎曲路徑','電氣規格、彎折循環、接觸電阻','靜止路徑不可直接套活動蓋'),application('工業設備','感測器配線','宿主固定與端子命名','屏蔽、接地、隔離、溫升','幾何安全距離不是電氣額定值'),application('建築','燈具供電','通路、端子與機械支承','當地電氣規範及實際額定','本教材不提供未驗的接線施工資格')
],'先具體綁定兩端點；機械保持、導電接觸與絕緣'+'是不同介面。'),
M('finish','材料、表面與可讀呈現',['form','communicate','protect'],'由基材、製程、表面層和光照共同表達材質，不改寫機械用途。','基材、加工方向、尺度、外觀目標、環境','可辨認的金屬、塗層、聚合物及接觸細節',['基材','成形／加工','表面處理','光照','觀看'],[['金屬表面','沿加工方向的微結構','控制反射及視覺細節','孔緣、倒角、接面','所有金屬都做成鏡面鉻'],['塗層／聚合物','有限材料層或表面微紋','外觀、觸感及其他指定功能','基底、邊界、厚度','材質顏色被用來推定材料牌號']],[ 'normals','projection','discretization','curvature','units'],[
application('精品家具','把手、桌腳與飾條','基材、加工方向及光影分工','觸感、磨耗、接合與表面工法','亮面不等於高級或耐用'),application('工業展示','工具與精密件展示','多角度反光揭示形狀','細節尺度、照明、剖面可讀性','用陰影掩蓋接面缺口'),application('電子產品','旋鈕與外殼','金屬和塗層分區','手汗、磨耗、手感及操作辨識','渲染粗糙度不是實物Ra數值')
],'渲染的roughness參數、加工粗糙度Ra與材料牌號不是同一種資料。'),
M('branching','分枝、薄片與自然形態',['form','support'],'用分枝關係、路徑和漸變截面重建可辨認的自然或仿生形態。','主幹、分枝位置、局部框架、葉片邊界及觀察來源','連接明確而不漂浮的形態',['主幹','次枝','葉柄','葉片母面','葉脈'],[['枝幹','漸變截面掃掠','承接分枝與局部方向','分枝根部過渡','互相穿過的圓柱被當成長在一起'],['葉片','薄曲面與有限厚度','形成輪廓、彎曲與葉脈','葉柄、葉脈和邊緣','只用重複平板代表所有葉型']],[ 'bezier','sweep','frame','loft','lattice','curvature'],[
application('景觀展示','室內植物模型','枝幹階層及薄片形狀','具體物種、葉序、比例和來源','幾何分枝規則不是生物生長機理'),application('工業設計','仿生支架','分枝式材料分配的形態思路','受力、製程、接頭和最佳化','看起來像樹不代表結構最佳'),application('照明','枝形燈具','主幹、分枝與端部宿主','電路、熱、承載及固定','形狀相似不能共用植物材料假設')
],'先區分'+'自然觀察、作者形態與工程功能；不要把形狀定理當成生物定律。')
];
export const productRoutes={S00:['frame','linear','hinge','spring','shell','finish'],D00:['hinge','linear','retention','seal','shell','electrical'],C00:['shell','frame','hinge','seal','finish'],L00:['optical','shell','seal','electrical'],I00:['shell','hinge','fastener','optical','channel','finish'],G00:['shell','seal','hinge','optical'],F00:['frame','fastener','shell'],U00:['bearing','spring','hinge','frame'],P00:['bearing','electrical','channel','shell'],T00:['channel','seal','shell'],E00:['electrical','retention','shell'],W00:['bearing','fastener','spacing','retention','seal'],A00:['frame','fastener','shell','channel','optical','linear','finish','branching']};
export const factoryRoutes={LEAF:['branching','finish'],STEM:['branching'],POT:['shell'],TUBE:['channel','frame'],FRAME:['frame','fastener'],FASTENER:['fastener','spacing','retention'],GLASS:['shell','seal','optical'],CLADDING:['shell','frame','seal'],FLOOR:['shell','finish'],DRAIN:['channel'],LIGHT:['optical','electrical'],DRAWER:['linear','shell','retention'],TIMBER:['frame','finish'],TOOL:['fastener','retention','frame'],FURNITURE:['frame','spring','shell','finish'],PAPER:['optical','finish'],MOBILITY:['bearing','linear','retention'],BOUNDARY:['frame','hinge','shell'],STORAGE:['shell','frame'],GENERIC:[]};

// A readable, explicitly authored route for each first-level product subsystem.
// Descendants receive this as CONTEXT, never as proof that every constituent has every role.
export const subsystemRoutes={
 S01:['frame'],S02:['frame'],S03:['linear','retention'],S04:['hinge','retention'],S05:['shell','spring'],S06:['shell','spring'],S07:['shell','finish'],S08:['shell','finish'],S09:['shell'],S10:['shell'],S11:['retention'],S12:['fastener'],
 D01:['shell','finish'],D02:['shell','frame'],D03:['frame'],D04:['optical','shell'],D05:['linear','electrical','retention'],D06:['frame','seal'],D07:['retention','hinge'],D08:['hinge'],D09:['shell','finish'],D10:['acoustic','electrical'],D11:['hinge','spring','retention','seal'],D12:['seal'],
 C01:['shell'],C02:['frame','hinge','retention'],C03:['shell'],C04:['shell'],C05:['shell'],C06:['shell','channel'],C07:['shell'],C08:['shell'],C09:['frame','channel'],C10:['shell','channel'],C11:['frame'],C12:['hinge','retention','fastener'],
 L01:['optical','seal'],L02:['shell','thermal'],L03:['optical'],L04:['optical','electrical'],L05:['optical','seal'],L06:['optical','shell','seal'],
 I01:['shell','frame','finish'],I02:['frame'],I03:['shell','hinge','fastener','finish'],I04:['hinge','electrical','finish'],I05:['optical','electrical','shell'],I06:['channel','hinge'],I07:['hinge','frame'],I08:['shell','finish'],I09:['retention','spring','frame'],
 G01:['optical','shell'],G02:['optical','shell'],G03:['optical','shell'],G04:['optical','hinge','shell'],G05:['seal'],G06:['hinge','seal'],
 F01:['frame','shell'],F02:['frame'],F03:['frame'],F04:['shell','channel'],F05:['shell'],F06:['frame'],F07:['frame'],F08:['shell','fastener'],
 U01:['bearing','frame'],U02:['frame','hinge'],U03:['frame','hinge'],U04:['spring','linear'],U05:['spring','hinge'],U06:['transmission','linear','hinge'],U07:['frame','hinge'],U08:['bearing','fastener','spring'],
 P01:['shell','frame','seal'],P02:['shell','seal'],P03:['electrical','thermal','frame'],P04:['transmission','electrical','bearing'],P05:['transmission','bearing','shell'],P06:['electrical','thermal','shell'],P07:['transmission','hinge','seal'],P08:['electrical','shell','hinge'],
 T01:['thermal','channel','frame'],T02:['channel','transmission','shell'],T03:['thermal','channel','hinge'],T04:['channel'],T05:['channel','seal','retention'],E01:['electrical','retention'],E02:['electrical','protect'],E03:['electrical','shell'],E04:['acoustic','electrical'],
 W01:['frame','seal'],B01:['friction','thermal'],H09:['fastener'],W03:['fastener'],'W02-r3':['seal','friction'],'B02-r2':['shell','channel','linear'],'B06-r2':['linear','seal'],W04:['shell','retention'],'A01-r2':['seal','frame'],B04:['friction'],B05:['frame'],B10:['seal'],B11:['seal'],B12:['retention'],B13:['spring'],B07:['fastener'],H03:['bearing'],H04:['bearing'],B08:['channel','seal','fastener'],B09:['shell','seal'],H08:['shell','seal'],H11:['spacing'],H10:['retention'],H12:['retention'],W05:['retention'],'H02-section':['bearing'],'H05-r3':['bearing','spacing'],H07:['bearing','frame'],W06:['spacing'],W07:['join'],V02:['seal'],V03:['spacing'],V04:['fastener'],V05:['shell','seal'],V10:['electrical'],'SOURCE-core':['channel','seal','spring'],'SOURCE-tpms':['channel','electrical'],'V01-r3':['channel','fastener'],'V07-r2':['shell'],V11:['fastener'],'A02-bearing-r2':['bearing'],'V09-r3':['electrical'],'V08-r2':['shell','retention'],'H01-r3':['bearing','frame'],'H06-r2':['seal'],'A06-wheel-end-r2':['bearing','friction','seal'],'A03-caliper-r3':['friction','linear','seal'],'B03-r3':['shell','channel'],'A05-contact':['seal','fastener'],'A05-valve-r3':['channel','seal'],'A07-tpms-r3':['electrical','shell'],'V06-source':['channel','seal','spring'],'V06-exterior':['channel','seal'],'H02-projection':['bearing'],'H02-r4':['bearing'],
 A01:['frame','fastener'],A02:['shell','channel','optical'],A03:['shell','seal','hinge'],A04:['frame','retention'],A05:['shell','channel'],A06:['optical','frame']
};
subsystemRoutes.E02=['electrical','shell'];subsystemRoutes.W07=['finish'];
mechanisms.push(
 M('transmission','傳動、轉速與力矩分配',['motion','transport'],'把一端運動與功率傳到另一端，並依機構改變方向、轉速或力矩。','驅動端、從動端、轉速、力矩、路徑及效率','受支承且介面明確的傳動',['輸入軸','傳動接面','輸出軸','負載'],[['軸與接頭','階梯軸、花鍵或鉸接','傳遞旋轉並連到宿主','支承、端部與相位','外殼會轉但軸沒有接上負載'],['齒輪／帶輪','週期齒形或輪槽','由接觸或張力傳遞運動','節距、中心距、齒側或帶接觸','用任意齒紋外觀推定正確嚙合']],[ 'rigid','constraints','circle','lattice','load'],[
 application('製造','減速機、送料機','輸入、支承、接觸與輸出分工','齒形、軸承、效率、潤滑與疲勞','齒數比例不能替代實際齒面接觸'),application('自行車','鏈輪與鏈條','週期配合及力流','節距、張力、包角、偏斜與護罩','輪廓近似不能保證鏈條可嵌合'),application('車輛','半軸、轉向齒條','運動輸入與輸出介面','工作角、扭轉、側隙與封裝','靜態位置相接不代表全行程能傳動')
 ],'先畫清楚功率從哪裡進出；殼體、支承與轉動件分別定義。'),
 M('friction','摩擦、制動與接觸控制',['motion','support','transport'],'以指定接觸面傳力或消耗機械能，控制滑動與運動。','正向力、接觸面、材料、相對速度與溫度','在指定工況下的接觸力及熱',['致動器','正向夾持','摩擦接面','反力宿主','熱流去向'],[['摩擦塊','有背部支承的接觸層','提供指定接觸面','摩擦面、背板、保持件','只看外形而漏掉背板反力'],['對偶面','盤、輪或平面','接收接觸力與熱','運動方向、接觸區','把固定常數摩擦係數套遍溫度和磨耗']],[ 'distance','constraints','integration','load'],[
 application('車輛','煞車','夾持、摩擦與散熱分工','速度、質量、溫度、材料、磨耗與失效','幾何組裝不等於煞停性能'),application('工業設備','送料壓輪','正向力及相對速度','表面損傷、打滑、污染與張力','增加夾力可能壓壞工作物'),application('家具','防滑腳墊','接觸及支承','地材、濕度、接觸面積與偏載','摩擦能力不能僅由黑色橡膠外觀推得')
 ],'分清靜摩擦、滑動摩擦與磨耗；每一個都需要指定工況。'),
 M('thermal','傳熱、散熱與溫度控制',['transport','protect'],'建立熱源到外界的連續熱傳路徑，並辨認熱阻與溫度限制。','熱源、材料、幾何、接觸及環境邊界','可追查的熱路徑與待驗溫度',['熱源','接觸層','導熱基體','流體或輻射表面','環境'],[['散熱片','薄片與連續基座','增加與環境交換的表面','基座、熱界面、流道','增加片數卻堵住流動空間'],['導熱接觸層','受控厚度薄層','連接熱源與散熱宿主','貼合、厚度、接觸壓力','渲染貼合被誤作已知接觸熱阻']],[ 'extrude','lattice','offset','integration','units'],[
 application('電子產品','處理器散熱器','熱源、基座、接觸與散熱表面','發熱功率、風流、熱阻與極限溫度','片形好看不代表散熱有效'),application('建築','圍護與隔熱','層次與熱路徑','材料導熱、濕度、接縫與季節邊界','小零件導熱模型不能直接代替建築熱濕分析'),application('車輛','散熱器與冷板','熱源、流道、介面分工','熱負荷、流量、壓降、洩漏與循環','只有管子相接不證明熱管理完成')
 ],'先分清傳導、對流與輻射；幾何面積只是輸入之一。'),
 M('acoustic','振動、聲音與訊息傳遞',['communicate','transport'],'由受驅動表面與介質把振動傳遞成聲音，或控制不需要的振動。','振動源、頻率、介質、接觸和空腔','聲學或振動回應的待驗模型',['驅動','振動面','介質／空腔','接收位置'],[['振膜','有邊界支承的薄面','把驅動轉成介質壓力擾動','懸邊、驅動連接、開口','音盆外形不能證明頻率響應'],['隔振件','可變形支承','改變力的傳遞','固定端、活動端、預壓','彈性外觀不能推定隔振頻率']],[ 'profile','sweep','elastic','load','units'],[
 application('音響','揚聲器與箱體','振膜、支承、腔體與開口分工','剛度、質量、頻響、阻尼及氣密','空殼模型不等於聲學設計'),application('機械','馬達隔振座','源、支承與宿主路徑','轉速、激振、模態及載荷','柔軟可能放大共振而非抑振'),application('建築','吸音板及隔音構造','振動傳播路徑與材料層','頻率、接縫、空氣路徑與實測','吸音和隔音不是同一個性能')
 ],'分清外觀重建、機械振動與聲學性能；不能用同一張網罩圖代替三者。')
);
productRoutes.W00.push('friction','thermal');productRoutes.P00.push('transmission','thermal');productRoutes.T00.push('thermal');productRoutes.D00.push('acoustic');
mechanisms.push(
 M('bond','黏合、焊接與永久接合',['join','support','protect'],'以指定接合工法把材料連接，並區分界面層與母材連續性的不同。','兩側材料、表面、接合區、工法與使用環境','有可辨認載荷路徑的永久接合',['母材A','接合區／接合層','母材B'],[['黏合層','有限厚度與連續足跡','透過接合層傳遞指定作用','兩側貼合面、膠厚、邊緣','把看起來貼住當成已知接合強度'],['焊接區','依接頭定義的接合形體','依選定製程連接母材','母材、接頭、熱影響區','用圓角造型冒充已驗證焊接']],[ 'offset','set','distance','load','uncertainty'],[
 application('車輛','平衡塊黏貼、玻璃接合','兩側宿主與接合層分工','基材、表面處理、厚度、固化及環境','裝飾貼圖不能當作實際膠層'),application('家具','木件膠接','接面足跡及載荷路徑','木紋、含水、膠種、壓合與長期載荷','金屬接合工法不能直接搬到木材'),application('製造','焊接框架','接頭與母材連接關係','材料、接頭、製程、變形與缺陷檢查','黏合模型不能代替焊接熱與冶金模型')
 ],'先選接合工法，再建立它的材料及製程模型；永久接合的拆卸可能必須破壞接合區。'),
 M('balance','質量分布、重心與旋轉平衡',['motion','support'],'控制質量分布相對支承或轉軸的位置，處理重心及不平衡。','各部位質量、位置、旋轉軸、轉速及支承','質量中心與待修正的不平衡關係',['材料密度與體積','質量位置','旋轉軸／支承','修正質量','實際量測'],[['配重','位於指定半徑及角度的質量','補償已量測的質量分布','固定／黏合、半徑、角度','放一塊金屬就宣稱已平衡'],['轉動本體','輪、轉子或葉輪','承載分布質量','支承軸、幾何及材料','幾何對稱不保證密度與裝配對稱']],[ 'integration','rigid','circle','load','units'],[
 application('車輛','輪圈平衡塊','量測、質量與安裝位置分工','輪胎輪圈組合、轉速、校正與保持','單個外觀模型不能證明動平衡'),application('家電','風扇葉輪','質量分布與旋轉支承','材料、轉速、雙面不平衡及振動','只驗重心不能推出所有轉速振動合格'),application('工具','手工具重心','質量中心與握持位置','各件材料密度、握持方式與操作載荷','同樣外形換材質後重心可能改變')
 ],'靜態重心、旋轉不平衡與結構振動分別建模；沒有實際質量資料時只保留幾何積分候選。')
);
subsystemRoutes.W06=['balance'];subsystemRoutes.W07=['bond'];productRoutes.W00.push('balance','bond');
