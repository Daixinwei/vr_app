/**
 * attached to manage.html
 */
var envId ="dxwvr-1e2175"
var user = null

var h_fileBoxList = document.getElementById("h-fileBox")
var h_fileNoticeSpan = document.getElementById("h-filenotice")
var nv_fileBoxList = document.getElementById("nv-fileBox")
var nv_fileNoticeSpan = document.getElementById("nv-filenotice")
var h_navtabList = document.getElementById("nav-tab1")
var h_navtabContent = document.getElementById("nav-tab1Content")
var comment_input = document.getElementById("comment-input")
const tempmanagerlist = ["admin01","admin02"]//managers' ID. edit when update collections in tcb database
const tempuserlist = ["temp01","temp02","temp03","temp04"]//users' ID. edit when update collections in tcb database

window.addEventListener("load",checkCookieAlluserVideoList,false)

const app =tcb.init({
    env:envId
})

var auth = app.auth({
    persistence: "local"
})

if(!auth.hasLoginState()) {
	auth.signInAnonymously()
}

const db =app.database()

/**
 * get the key value by index name
 * @param {*} cname index name for searching in cookie
 */
function getCookie(cname){
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name)==0) { return c.substring(name.length,c.length); }
    }
    return "";
}

/**
 * check chookie and video list of user when loading document
 */
function checkCookieAlluserVideoList(){
    user = getCookie("username");
    helloUserName.innerHTML = "Hello! " + user;
    if (tempmanagerlist.indexOf(user) != -1)//如果cookie中有记录用户名字则加载该用户的文件列表 
    {   
        refreshJumbotron()      
        refreshFileBox(nv_fileBoxList, nv_fileNoticeSpan, true)
        //refreshFileBox(h_fileBoxList, h_fileNoticeSpan, false)
        refreshWeeklyTab(2020,9,21)
    }
    else{//该用户未登录
        alert("Please login!");
        window.open("login.html","_self");
        //window.open("login.html","_self");
    }
}

/**
 *
 * reread data base and then refresh the file box 
 * @param {*} fileBoxList div element for file box 
 * @param {*} fileNoticeSpan span element for file notice 
 * @param {*} isNewVideo is the fixbox in "New Video" page
 */
async function refreshFileBox(fileBoxList, fileNoticeSpan, isNewVideo){
    var num = -1;
    const _ = db.command;
    var temprownode = null;
    for(var i=0; i<tempuserlist.length;i++)
    {
        var uname = tempuserlist[i]
        var ucollection = db.collection(uname)      
        await ucollection.where({type:"file", fileID:_.neq(null)})
        .get()
        .then(function (res) 
        {
            if(res.data.length > 0)
            {       
                for(var j=0;j<res.data.length;j++)
                {   
                    var isCheckbyU = false;
                    var comment = res.data[j].ct;
                    if(comment instanceof Array)
                    {
                        comment.forEach(function(commentObj)
                        {
                            if(commentObj.by == user)
                                isCheckbyU = true;
                        })
                    }
                    if(isNewVideo && isCheckbyU){
                        continue
                    }
                    else
                    {
                        num ++
                    }

                    //生成一个卡片      
                    var cardnode = document.createElement("div");
                    writeCard(res.data[j], cardnode, isNewVideo)                     
                    if (num % 3 == 0) //如果为新的一行
                    {
                        var rownode = document.createElement("div");
                        rownode.setAttribute("class","row");
                        temprownode = rownode; 
                        temprownode.appendChild(cardnode);
                        fileBoxList.appendChild (temprownode);
                    }
                    else
                    {
                        temprownode.appendChild(cardnode);                            
                    }  
                }
            }
        })
    }
    if(num == -1)
    {
        if(isNewVideo == true)
        {
            fileNoticeSpan.innerText = "No new video"
            $("#hm-checknewvideoreminder").hide()
            $("#jb-reminder").text("No new video need to be commented")
        }
        else
        {
            fileNoticeSpan.innerText = "No video uploaded"
            
        }
    }
    else
    {
        if(isNewVideo == true)
        {
            $("#jb-reminder").text("You have uncommented video")
            $('[data-toggle="popover"]').popover('show')
        }
    }
}

/**
 *
 * used in "history" page 
 * @param {*} fileBoxList div element for file box (id="h-filebox")
 * @param {*} date  the value U input in the input box
 */
async function searchByDate(fileBoxList, date){
    var num = -1;
    const _ = db.command;
    var temprownode = null;
    for(var i=0; i<tempuserlist.length;i++)
    {
        var uname = tempuserlist[i]
        var ucollection = db.collection(uname)      
        await ucollection.where({type:"file", date:_.eq(date)})
        .get()
        .then(function (res) 
        {
            if(res.data.length > 0)
            { 
                for(var j=0;j<res.data.length;j++)
                {   
                    num ++
                    //生成一个卡片      
                    var cardnode = document.createElement("div");
                    writeCard(res.data[j], cardnode, false)                     
                    if (num % 3 == 0) //如果为新的一行
                    {
                        var rownode = document.createElement("div");
                        rownode.setAttribute("class","row");
                        temprownode = rownode; 
                        temprownode.appendChild(cardnode);
                        fileBoxList.appendChild (temprownode);
                    }
                    else
                    {
                        temprownode.appendChild(cardnode);                            
                    }  
                }
            }
        })
    }

    if(num > -1)
        return true
    else 
        return false
}

async function searchById(value)
{
    const _ = db.command;
    var temprownode = null;
    var ucollection = db.collection(value)      
    await ucollection.where({type:"file", fileID:_.neq(null)})
        .get()
        .then(function (res) 
        {
            if(res.data.length > 0)
            { 
                for(var i=0; i<res.data.length; i++)
                {   
                    //生成一个卡片      
                    var cardnode = document.createElement("div");
                    writeCard(res.data[i], cardnode, false)                     
                    if (i % 3 == 0) //如果为新的一行
                    {
                        var rownode = document.createElement("div");
                        rownode.setAttribute("class","row");
                        temprownode = rownode; 
                        temprownode.appendChild(cardnode);
                        h_fileBoxList.appendChild (temprownode);
                    }
                    else
                    {
                        temprownode.appendChild(cardnode);                            
                    }  
                }
            }
            else
            {
                h_fileNoticeSpan.innerText = "No video uploaded by him/her"
            }
        })
}


/**
 *
 * load one card about video information
 * @param {*} result
 * @param {*} cardnode
 * @param {*} isNewVideo
 */
async function writeCard(result, cardnode, isNewVideo){
    var date = result.date; //*在这获取文件上传的日期
    var format = result.format;
    var note = result.note;
    var comment = result.ct; //*在这获取文件的评论
    var id = result._id;
    await app.getTempFileURL({fileList:[result.fileID]})
    .then(function(res){
        //动态生成html元素并压入：
        //获得文件下载链接 url 和 文件名 fileName
        var fileObj = res.fileList[0];                            
        var url = fileObj.tempFileURL;
        var temparray = url.split('/');
        var fileName = temparray.pop();//get the name from fileID
        var un = temparray.pop();
        
            //X图标，删除
            var inode = document.createElement("i");
            inode.className = "icon fas fa-times float-right mb-1";
            inode.style.cursor = "pointer";
            inode.addEventListener("click", function(e){ 
                e.stopPropagation();
                e.preventDefault(); 
                deleteFile(fileObj.fileID, un)}, 
                false);
            //视频缩略图（<video><source></source></video>,只支持mp4类型的文件）
            var videonode= document.createElement("video");
            videonode.setAttribute("width", "100%");
            videonode.setAttribute("height", "200px");
            videonode.setAttribute("controls", "controls");

            var sourcenode = document.createElement("source");
            sourcenode.setAttribute("src", url);
            sourcenode.setAttribute("type", "video/mp4");
            videonode.appendChild(sourcenode);

            //生成Date uploader format note 
            var hdatenode = document.createElement("p");
            hdatenode.innerText = date
            var spanbadge = document.createElement("span")
            spanbadge.className = "badge badge-secondary float-right"
            spanbadge.innerText = format
            hdatenode.appendChild(spanbadge)
            var uploadbynode = document.createElement("p")
            uploadbynode.style.fontSize = "12px"
            uploadbynode.style.fontWeight = "700"
            uploadbynode.innerHTML = "Uploaded by "+un
            var pnotenode = document.createElement("p")
            pnotenode.setAttribute("style","color:gray; height: 50px; word-break:break-all; overflow: hidden") 
            pnotenode.innerHTML = "Note: " + note

            
            //comment button
            var buttonnode = document.createElement("button")
            if(isNewVideo)
                buttonnode.innerText = "Add Comment"  
            else
                buttonnode.innerText = "Edit Comment"  
            buttonnode.type = "button"
            buttonnode.className = "btn btn-secondary btn-block mb-2"
            buttonnode.style.textShadow = "black 2px 1px 1px"
            buttonnode.setAttribute("data-toggle","modal")
            buttonnode.setAttribute("data-target","#comment-modal")
            buttonnode.addEventListener("click", function(e){ 
                e.preventDefault();
                if(comment)
                {
                    if(comment instanceof Array)
                    {
                        try
                        {
                            comment.forEach(function(commentObj)
                            {
                                if(commentObj.by == user){
                                    comment_input.value = commentObj.content
                                    throw new Error("end")
                                }              
                                else
                                    comment_input.value = ""
                            })
                        }catch(e)
                        {
                            if(e.message!="end") throw e
                        }
                    }
                }
                else
                    comment_input.value = ""
                $('#comment-button').unbind("click")
                $('#comment-button').click(async function (e) { 
                    e.preventDefault(); 
                    await giveComment(fileObj.fileID, un, comment_input.value) 
                    $('#nav-tab1').empty(); 
                    $('#nav-tab1Content').empty(); 
                    $('#nv-fileBox').empty(); 
                    refreshWeeklyTab(2020,9,21)
                    refreshFileBox(nv_fileBoxList, nv_fileNoticeSpan, true)
                });
                }, 
                false);       
            
            //comment - collapse box
            var divcommentnode = document.createElement("div")
            divcommentnode.innerText = "comment"
            divcommentnode.className="text-right"
            divcommentnode.style.color ="rgb(231, 90, 100)"
            var icommentnode = document.createElement("i")
            icommentnode.style.cursor = "pointer"
            icommentnode.className = "icon fas fa-angle-double-down"
            icommentnode.setAttribute("data-toggle", "collapse")
            icommentnode.setAttribute("data-target", "#tcollapse" + id)
            divcommentnode.appendChild(icommentnode)
            var divcollapsenode = document.createElement("div")
            var cardbodynode = document.createElement("div")
            divcollapsenode.className = "collapse"
            divcollapsenode.id = "tcollapse" + id
            cardbodynode.className = "card card-body"
            if(comment)
            {
                if(comment instanceof Array)
                {
                    comment.forEach(function(commentObj)
                    {
                        var pcommentObjNode = document.createElement("p")
                        pcommentObjNode.innerHTML =
                            "<i style='width: 25px;' class='fas fa-user-circle'></i>" 
                            + "<strong>"+commentObj.by+": </strong> "
                            + commentObj.content;
                        cardbodynode.appendChild(pcommentObjNode)                
                    })
                }
            }
            else
                cardbodynode.innerText = "No Comment yet"
            divcollapsenode.appendChild(cardbodynode)
        
        //生成外部div（idivnod ）
        var idivnode = document.createElement("div");

        //将以上所有元素压入idivnode，idivnode压入cardnode
        if(!isNewVideo)
            idivnode.appendChild(inode)
        idivnode.appendChild(videonode);
        idivnode.appendChild(hdatenode);
        idivnode.appendChild(uploadbynode);
        idivnode.appendChild(pnotenode);
        idivnode.appendChild(buttonnode);
        idivnode.appendChild(divcommentnode);
        idivnode.appendChild(divcollapsenode)

            
        idivnode.setAttribute("class","border rounded-sm");
        idivnode.setAttribute("style","padding: 15px");
        cardnode.setAttribute("class","col-md-4 py-2");
        cardnode.appendChild(idivnode);
    })
}

/**
 *
 * delete file
 * @param {*} tfileID file ID 
 * @param {*} tusername user name of collection
 */
function deleteFile(tfileID, tusername){
    //删除文件
    app.deleteFile({fileList:[tfileID]})
    .then(res=>{
        db.collection(tusername).where({type:"file", fileID:tfileID}).remove() //从该用户的集合删除形容该文件的文档
        .then(res2=>{
            $(".toast").eq(0).toast("show")
            $('#nav-tab1').empty(); 
            $('#nav-tab1Content').empty(); 
            $('#nv-fileBox').empty(); 
            refreshWeeklyTab(2020,9,21)
            refreshFileBox(nv_fileBoxList, nv_fileNoticeSpan, true)
        });
    });       
}

/**
 *
 * give comment
 * @param {*} tfileID file ID
 * @param {*} tusername user name of collection
 * @param {*} tcomment comment inputed
 */
async function giveComment(tfileID, tusername, tcomment){
    var commentList;
    var isHaveComment = false;
    await db.collection(tusername).where({type:"file", fileID:tfileID}).get().then(res=>{
        commentList = res.data[0].ct
        if(commentList == null)
        {
            commentList = [{content:tcomment,by:user}]
        }
        else
        {
            commentList.forEach(function(comment){
                if(comment.by == user){
                    isHaveComment = true;
                    comment.content = tcomment
                }
            })
            if(isHaveComment == false)
            commentList.push({content:tcomment,by:user})
        }
    })

    await db.collection(tusername).where({type:"file", fileID:tfileID}).update({ct:commentList, isCheck:true, isComment:true});
}

//control jumbotron
function refreshJumbotron()
{
    $("#jb-hellomanager").text("Hello," + user)
    $("#jb-date").text("Today is " + getTodayDate())
}
function getTodayDate()
{
    var date = new Date();
    var year = date.getFullYear(); //获取完整的年份(4位)
    var day = date.getDate(); //获取当前日
    var months = 
        [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
        ];
    if (day == 1 || day == 11 || day == 21 || day == 31) {
        day = day + "(st)";
    }
    else if (day == 2 || day == 12 || day == 22)
    {
        day = day + "(nd)";
    }
    else if(day == 3 || day == 13 || day == 23)
    {
        day = day + "(rd)";
    }
    else
    {
        day = day + "(th)";
    }
    var currentdate = months[date.getMonth()] + " " + day +", " + year;
    return currentdate;   
}


/**
 *
 *
 * @param {*} startYear 正整数
 * @param {*} startMonth 1~12
 * @param {*} startDate 最好是周一的日期
 */
function refreshWeeklyTab(startYear, startMonth, startDate)
{
    var monthlyday = 
        [
            {m:"Jan.", d:31}, {m:"Feb.", d:28}, {m:'Mar.', d:31},
            {m:"Apr.", d:30}, {m:"May.", d:31}, {m:"Jun.", d:30},
            {m:"Jul.", d:31}, {m:"Aug.", d:31}, {m:"Sept.", d:30},
            {m:"Oct.", d:31}, {m:"Nov.", d:30}, {m:"Dec.", d:31},
        ] 
        var date = new Date()
        var currentYear = date.getFullYear()
        var currentMonth = date.getMonth() + 1
        var currentDate = date.getDate()

        //判断是否为闰年来修改对象数组
        if(startYear % 4==0 && startYear % 100!=0 || startYear % 400==0)
        {
            monthlyday[1].d = 29
        }
        else
        {
            monthlyday[1].d = 28
        }

        do{
            var dateInWeek = dateCalculate(monthlyday, startYear, startMonth, startDate, 6)
            var tempDate = dateInWeek.date
            var tempMonth = dateInWeek.month
            var tempYear = dateInWeek.year

            //生成该周的板子
            var idNum = startYear + '' + startMonth + '' + startDate
            var tabname = monthlyday[startMonth-1].m + " Week "+ Math.floor(startDate/7 + 1) 
            var a_tab = document.createElement("a")
            var div_tabcontent = document.createElement("div")
            a_tab.className = "nav-item nav-link"
            a_tab.id = "nav-" + idNum + "-tab"
            a_tab.setAttribute("data-toggle", "tab")
            a_tab.setAttribute("role","tab")
            a_tab.href = "#nav-"+ idNum
            a_tab.innerText = tabname
            div_tabcontent.className = "tab-pane fade"
            div_tabcontent.id = "nav-" + idNum
            div_tabcontent.setAttribute("role","tabpane1")
            if(h_navtabList.children.length == 0)
                h_navtabList.appendChild(a_tab)
            else
            {
                var child = h_navtabList.children[0]
                h_navtabList.insertBefore(a_tab, child)
            }
            h_navtabContent.appendChild(div_tabcontent)

            //压入该周有视频上传的日子板子
            for(var i = 0; i < 7; i++)
            {
                var videoYear = dateCalculate(monthlyday, startYear, startMonth, startDate, i).year
                var videoMonth = dateCalculate(monthlyday, startYear, startMonth, startDate, i).month
                var videoDate = dateCalculate(monthlyday, startYear, startMonth, startDate, i).date
                var value = dateFormatChange(videoYear, videoMonth, videoDate)
                var h2_date = document.createElement("h2")
                var div_fileBox = document.createElement("div")
                var hr_line = document.createElement("hr")
                h2_date.style.color = "grey"
                if (videoMonth <= 9) {
                    videoMonth = "0" + videoMonth;
                }
                if (videoDate <= 9) {
                    videoDate = "0" + videoDate;
                }
                h2_date.innerText = videoMonth + "/" + videoDate
                
                searchByDate(div_fileBox, value).then(res=>
                {})
                if(div_tabcontent.children.length == 0)
                {
                    div_tabcontent.appendChild(h2_date)
                    div_tabcontent.appendChild(div_fileBox)
                    div_tabcontent.appendChild(hr_line) 
                }
                else{
                    div_tabcontent.insertBefore(h2_date,div_tabcontent.children[0])
                    div_tabcontent.insertBefore(div_fileBox,div_tabcontent.children[1])
                    div_tabcontent.insertBefore(hr_line,div_tabcontent.children[2])
                }
            }
            var dateInDay = dateCalculate(monthlyday, tempYear, tempMonth, tempDate, 1)
            startYear = dateInDay.year
            startMonth = dateInDay.month
            startDate = dateInDay.date  

            var isLoop = true
            isLoop = !((startYear > currentYear) 
            || (startYear == currentYear && startMonth > currentMonth)
            || (startYear == currentYear && startMonth == currentMonth && startDate > currentDate))
            if(isLoop == false)
            {
                a_tab.className = "nav-item nav-link active"
                div_tabcontent.className= "tab-pane fade show active"
            }
        }while(isLoop)
}
function dateFormatChange(year, month, date)
{
    var sep = "-";
    if (month <= 9) {
		month = "0" + month;
	}
	if (date <= 9) {
		date = "0" + date;
	}
	var currentdate = year + sep + month + sep + date;
	return currentdate;
}
function dateCalculate(tmonthlyday, year, month, date, plusDate)
{
    var y = year
    var m = month
    var d = date + plusDate

    if( d > tmonthlyday[m-1].d)
    {
        d = d - tmonthlyday[m-1].d
        m = m +1
        if(m > 12)
        {
            m = m -12
            y = y + 1
        }
    }
    return {year:y, month:m, date:d}
}

//Jquery.new code (Date: 200929~)
$(document).ready(function($){
var $h_filebox = $("#h-fileBox"),
    $page_home = $("#cd-home"), 
    $page_newvideo = $("#cd-newvideo"),
    $page_history = $("#cd-history"),
    $tab_whole = $(".menu"),
    $tab_home = $tab_whole.children('li').eq(0),
    $tab_newvideo = $tab_whole.children('li').eq(2),
    $tab_history = $tab_whole.children('li').eq(4)
    $("#hm-checknewvideobt").on('click', newVideoSelected)

    $page_home.show()
    $page_newvideo.hide()
    $page_history.hide()
    //switch page from nav
    $tab_whole.on('click', function (event) {
        event.preventDefault()
        if($(event.target).is($tab_home))
        {
            homeSelected()
        }
        else if($(event.target).is($tab_newvideo)) 
        {   
            newVideoSelected()
        }
        else if($(event.target).is($tab_history))
        {
            historySelected()
        }
    })

    function homeSelected()
    {
        $page_home.fadeIn()
        $page_newvideo.fadeOut()
        $page_history.fadeOut("slow")
        $tab_home.addClass("active")
        $tab_newvideo.removeClass("active")
        $tab_history.removeClass("active")
    }

    function newVideoSelected()
    {
        $('[data-toggle="popover"]').popover('hide')
        $('[data-toggle="popover"]').popover('disable')
        $page_home.fadeOut()
        $page_newvideo.fadeIn()
        $page_history.fadeOut("slow")
        $tab_home.removeClass("active")
        $tab_newvideo.addClass("active")
        $tab_history.removeClass("active")
    }

    function historySelected()
    {
        $page_home.fadeOut()
        $page_newvideo.fadeOut()
        $page_history.fadeIn("slow")
        $tab_home.removeClass("active")
        $tab_newvideo.removeClass("active")
        $tab_history.addClass("active")
    }

    //select date from calendar
    $("#datetimepicker").datetimepicker({
        format:'YYYY-MM-DD',
        locale:'ja'
    })

    //search by date
    $("#date-search").on('blur',function(event){ 
        event.preventDefault()
        $h_filebox.empty()
        h_fileNoticeSpan.innerText = null
        if(this.value.length==0)
        {
            refreshFileBox(h_fileBoxList, h_fileNoticeSpan, false)
        }
        else
        {
            searchByDate(h_fileBoxList, h_fileNoticeSpan, this.value)
        }
    })

    //search by ID
    $("#inputGroupSelect01").on('change',function(event){
        event.preventDefault()
        $h_filebox.empty()
        h_fileNoticeSpan.innerText = null
        if(this.value == "Choose...")
        {
            refreshFileBox(h_fileBoxList, h_fileNoticeSpan, false)
        }
        else
        {
            searchById(this.value)
        }
    })
})