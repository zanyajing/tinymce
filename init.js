//定义变量
var edit;//自定义变量，编辑器body
var mousepitch//tinymce自带变量，选中文本范围对象
var mouseObj;
var editor;

//初始化编辑器
tinymce.init({
    //编辑器容器
    selector: '#edit-me',
    //语言
    language: 'zh_CN',
    //文本样式
    style_formats: [
        {
            title: '正文', block: 'p', styles:
            { 'text-align': 'left', 'font-weight': 'normal', 'font-size': '12pt' }
        },
        {
            title: '小标题', block: 'h3', styles:
            { 'text-align': 'center', 'font-weight': 'bold', 'font-size': '14pt' }
        },
        {
            title: '大标题', block: 'h2', styles:
            { 'text-align': 'center', 'font-weight': 'bold', 'font-size': '16pt' }
        },
        {
            title: '正文加粗', block: 'p', styles:
            { 'text-align': 'left', 'font-weight': 'bold', 'font-size': '12pt' }
        }
    ],
    //插件（项目符号，自动创建超链接，自动调整大小，列表，字符映射表，打印，预览，锚点anchor）
    //插件（查找替换searchreplace，所见即所得visualblocks，代码code，全屏fullscreen）
    //插件（表格，超链接，复制粘贴，文本颜色，图片工具imagetools）
    plugins: ["advlist autolink autoresize lists  charmap  print preview",
        "table link paste textcolor searchreplace wordcount contextmenu","image code"
    ],
    //工具栏（插入文件insertfile）
    toolbar: "undo redo | styleselect |  bold  underline removeformat | forecolor  | alignleft aligncenter alignright | bullist numlist outdent indent customIndent | table searchreplace print batchDeleteRemark |undo redo | image code",
    //隐藏菜单栏
    menu: {
        file: { title: 'File', items: 'new saveas download export info history qr' },
        edit: { title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall | searchreplace' },
        format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript | formats | removeformat' },
        table: { title: 'Table', items: 'inserttable tableprops deletetable | cell row column plugin1' },
        plugin: { title: '插件', items: 'library term myterm mydocument' }
    },
    menubar: "file edit format table plugin,insert",
    contextmenu: "inserttable | cell row column deletetable",
    resize: false,
    statusbar: false,
    br_in_pre: false,
    branding: false,
    verify_html: false,
    advlist_bullet_styles: "disc",
    images_upload_url: 'postAcceptor.php',
    //advlist_number_styles: "default",
    textcolor_map: [
        "000000", "黑色",
        "FF0000", "红色",
        "FFD900", "黄色",
        "4DA8EE", "蓝色"
    ],
    table_default_styles: {
        width: '100%'
    },
    paste_convert_word_fake_lists: false,
    formats: {
        bold: { inline: 'strong' },
        italic: { inline: 'i' },
        underline: { inline: 'u' }
    },
    paste_word_valid_elements: "b,strong,i,p,h1,h2,h3,-table,-tr[rowspan|align|valign],tbody,thead,tfoot,#td[colspan|rowspan|align|valign|scope],#th[colspan|rowspan|align|valign|scope],ul,li,ol,span,u",
    paste_webkit_styles: "text-align",
    paste_retain_style_properties: "text-align",
    max_width: "748px",
    min_height: "900px",
    //引入样式表（控制的是输入的文本的样式）
    content_css: 'Content/document-content.css',
    paste_preprocess: function (plugin, args) {
        var pasterCount = args.content.length;
        var wordCount = editor.plugins.wordcount.getCount();
        if ((pasterCount + wordCount) > 10000) {
            warningAlert("您已超过最大字数限制");
            args.content = '';
        }
    },
    paste_postprocess: function () {
        // initRemark();
    },
    entity_encoding: 'raw',
    image_list: [
        {title: 'My image 1', value: 'https://www.tinymce.com/my1.gif'},
        {title: 'My image 2', value: 'http://www.moxiecode.com/my2.gif'}
    ],
    setup: function (editor) {
        //新建
        editor.addMenuItem('new', {
            text: "新建",
            context: "file",
            icon: "newdocument",
            onclick: function () {
                var url = "/document/AddDocument?FolderId=00000000-0000-0000-0000-000000000000";

                window.open(url);
            }
        });
        //另存
        editor.addMenuItem('saveas', {
            text: "另存",
            context: "file",
            icon: "save",
            onclick: function () {
                copy(id, $("#title").text());
            }
        });
        //下载
        editor.addMenuItem('download', {
            text: "下载",
            context: "file",
            onclick: function () {
                download(id);
            }
        });
        //导出
        editor.addMenuItem('export', {
            text: "导出",
            context: "file",
            onclick: function () {
                emailto(id);
            }
        });
        //历史版本
        editor.addMenuItem('history', {
            text: "历史版本",
            context: "file",
            onclick: function () {
                $("#editModalLg .modal-content").load("/document/documentVersions?id=" + id);
                $("#editModalLg").modal("show");
            }
        });
        //手机查看
        editor.addMenuItem('qr', {
            text: "手机查看",
            context: "file",
            onclick: function () {
                $("#qrUrlCode").html(' ');
                $("#documentModalLgQrcode #qrUrlCode").kendoQRCode({
                    value: window.location.href,
                    size: 120,
                    color: "#000000"
                });
                $("#documentModalLgQrcode").modal("show");
            }
        });
        //简介
        editor.addMenuItem('info', {
            text: "简介",
            context: "file",
            onclick: function () {
                $("#editModal .modal-content").load("/document/documentInfo?id=" + id);
                $("#editModal").modal("show");
            }
        });
        //合同库
        editor.addMenuItem('library', {
            text: "合同库",
            context: "plugin",
            icon: "selected",
            onclick: function (e) {
                if (getCookie("library-plugin") != "false") {
                    setCookie("library-plugin", false, 365);
                } else {
                    setCookie("library-plugin", true, 365);
                }
                initPlugin();
            }
        });
        //条款库
        editor.addMenuItem('term', {
            text: "条款库",
            context: "plugin",
            icon: "selected",
            onclick: function (e) {
                if (getCookie("term-plugin") != "false") {
                    setCookie("term-plugin", false, 365);
                } else {
                    setCookie("term-plugin", true, 365);
                }
                initPlugin();
            }
        })
        //我的条款
        editor.addMenuItem('myterm', {
            text: '我的条款',
            context: "plugin",
            icon: "selected",
            onclick: function (e) {
                if (getCookie("myterm-plugin") != "false") {
                    setCookie("myterm-plugin", false, 365);
                } else {
                    setCookie("myterm-plugin",true, 365);
                }
                initPlugin();
            }
        });
        //我的条款
        editor.addMenuItem('mydocument', {
            text: '我的文件',
            context: "plugin",
            icon: "selected",
            onclick: function (e) {
                if (getCookie("mydocument-plugin") != "false") {
                    setCookie("mydocument-plugin", false, 365);
                } else {
                    setCookie("mydocument-plugin", true, 365);
                }
                initPlugin();
            }
        });

        editor.addButton('customIndent', {
            image: 'Content/img/customIndent.png',
            tooltip: "首行缩进",
            onclick: indent
        });
        editor.addButton('batchDeleteRemark', {
            image: 'Content/img/batchDeleteRemark.png',
            tooltip: "清空批注",
            onclick: batchDeleteRemark
        });
    }
});
var preText = '';
function sendPatch() {
    // preText = tinymce.get("edit-me").getContent();
    // console.log(preText)
    // setTimeout(function () {
        var textNext  = tinymce.get("edit-me").getContent();
        console.log(textNext)
        // if(preText !== textNext){
            // console.log(textNext)
        // }
    // },500)
}

window.onload = function () {
	var active=$(".plugin-tab");

		active.on('click',function(){
	     var index = $(this).index();
		 $(this).addClass('plugin-tab-active').siblings().removeClass('plugin-tab-active');
		 console.log(1111,index)
		 $('.plugin-content').eq(index).show().siblings().hide();
	})
	
	
		
	var bol = true;
	 $(".plugin-close").click(function () {
	 	 if(bol){
	     $(".plugin-area").animate({right:- ($(".plugin-area").width()+12)},1000);
	 	 }else{
	 	 	$(".plugin-area").animate({right:0},1000);
	 	 }
	 	 bol = !bol;
     });
//     //初始化用户插件配置
//     initPlugin();
//     //初始化用户信息
//     // var userInfo = GetUserInfo();
//     //console.log(userInfo)
//     // $("input[name='avatar']").val(userInfo.Avatar);
//     // $("input[name='name']").val(userInfo.Name);
//     //初始化用户头像
//     // $("#remark-input img").attr("src", userInfo.Avatar);
//
//     edit = $("#edit-me_ifr", document).contents().find("#tinymce");
//
    editor = tinyMCE.activeEditor;
    editor.on("undo redo  propertychange input",sendPatch);
//
//     //初始化批注
//     $("#add-remark").css("display", "none");
//     $("#remark-input").css("display", "none");
//     $("#remark-input div").text("");
//
//     $("#mceu_26-open").on("click", _.debounce(function () {
//         initPlugin();
//     }, 70, false));
//
//     //设置插入批注按钮
//     edit.on("mouseup", edit, function (e) {
//         //console.log($(e.target).offset().top)
//         if ($("body").width() > 768) {
//             mousepitch = tinymce.activeEditor.selection.getRng();
//             var selection = tinymce.activeEditor.selection.getContent();
//             //文本选中，没有data-id
//             if (!$(e.target).attr("data-id")) {
//                 //
//                 if ($(e.target).find(".focus").length > 0) {
//                     $(".remark-list-item").each(function () {
//                         if ($(this).attr("data-id") == $($(e.target).find(".focus")[0]).attr("data-id")) {//data-id
//                             $(this).parent().addClass("remark-list-items-hover");
//                             $(this).parent().siblings().removeClass("remark-list-items-hover");
//                             edit.find(".focus").removeClass("focus-hover");
//                             $(e.target).find(".focus").addClass("focus-hover");
//                             return false;
//                         }
//                     });
//                     $("#add-remark").css({
//                         "top": $(e.target).offset().top,//top
//                         "display": "block"
//                     });
//                 } else {
//                     if ($(e.target).offset().top == 0) {
//                         $("#add-remark").css("display", "none");
//                     } else {
//                         $("#add-remark").css({
//                             "top": $(e.target).offset().top,//top
//                             "display": "block"
//                         });
//                     }
//                 }//data-id
//                 //文本选中，有data-id
//             } else {
//                 $(".remark-list-item").each(function () {
//                     $("#add-remark").css("display", "none");
//                     if ($(this).attr("data-id") == $(e.target).attr("data-id")) {//data-id
//                         $(this).addClass("remark-list-item-hover");
//                         $(this).siblings().removeClass("remark-list-item-hover");
//                         $(this).parent().addClass("remark-list-items-hover");
//                         $(this).parent().siblings().removeClass("remark-list-items-hover");
//                         edit.find(".focus").removeClass("focus-hover");
//                         $(e.target).addClass("focus-hover");
//                         $("#add-remark").css("display", "none");
//                     }
//                 });
//             }
//             //跨标签选中
//             if (selection.indexOf("</em>") > -1 || selection.indexOf("</p>") > -1 || selection.indexOf("</ol>") > -1 || selection.indexOf("</ul>") > -1 || selection.indexOf("</li>") > -1 || selection.indexOf("</h2>") > -1 || selection.indexOf("</h3>") > -1 || selection.indexOf("</td>") > -1) {
//                 $("#add-remark").css("display", "none");
//             }
//         } else {
//             $("#add-remark").css("display", "none");
//         }
//     });
//
//     //编辑时清除批注样式(跨段显示批注已修复)
//     edit.on("mousedown", "h1,h2,p,tr,th,td,ul,ol,li,strong,i,b,em,span", function (e) {
//         if ($("body").width() > 768) {
//             mousepitch = tinymce.activeEditor.selection.getRng();
//             mouseObj = $(mousepitch.commonAncestorContainer.parentElement);
//             edit.find(".focus-hover").removeClass("focus-hover");
//             edit.find("[class]").each(function () {
//                 if ($(this).attr("class") == "") {
//                     $(this).removeAttr("class");
//                 }
//             });
//             //console.log($(e.target).prop("tagName"))
//             if ($(e.target).attr("data-id") == undefined || $(e.target).attr("id") == tinymce) {//data-id
//                 if ($(e.target).find("em").length == 0 && $(e.target).prop("tagName") != "TD") {
//                     $(".remark-list-items").each(function () {
//                         $(this).removeClass("remark-list-items-hover");
//                     });
//                     $(".remark-list-item").each(function () {
//                         $(this).removeClass("remark-list-item-hover");
//                     });
//                     $("#remark-input").css("display", "none");
//                 } else if ($(e.target).find(".focus").length > 0) {
//                     $(e.target).find(".focus").each(function () {
//                         var dataId = $(this).attr("data-id");
//                         $(".remark-list-item").each(function () {
//                             if ($(this).attr("data-id") == dataId) {//data-id
//                                 $(this).parent().addClass("remark-list-items-hover");
//                                 $(this).parent().siblings().removeClass("remark-list-items-hover");
//                                 edit.find(".focus").removeClass("focus-hover");
//                                 $(e.target).find(".focus").addClass("focus-hover");
//                                 return false;
//                             }
//                         });
//                     });
//                 } else if ($(e.target).closest("tr").find(".focus").length > 0) {
//                     $(e.target).closest("tr").find(".focus").each(function () {
//                         var dataId = $(this).attr("data-id");
//                         $(".remark-list-item").each(function () {
//                             if ($(this).attr("data-id") == dataId) {//data-id
//                                 $(this).parent().addClass("remark-list-items-hover");
//                                 $(this).parent().siblings().removeClass("remark-list-items-hover");
//                                 edit.find(".focus").removeClass("focus-hover");
//                                 $(e.target).closest("tr").find(".focus").addClass("focus-hover");
//                                 return false;
//                             }
//                         });
//                     });
//                 }
//             } else if ($(e.target).attr("data-id")) {
//                 $(".remark-list-item").each(function () {
//                     if ($(this).attr("data-id") == $(e.target).attr("data-id")) {//data-id
//                         $(this).addClass("remark-list-item-hover");
//                         $(this).siblings().removeClass("remark-list-item-hover");
//                         $(this).parent().addClass("remark-list-items-hover");
//                         $(this).parent().siblings().removeClass("remark-list-items-hover");
//                         $(e.target).addClass("focus-hover");
//                     }
//                 });
//             }
//         }
//     });
//
//
//
//     if (!isEdge) {
//
//         editor.on("keyup change undo redo propertychange input", function () {
//             startType();
//         });
//     }
//     else {
//         editor.on("keydown change undo redo propertychange input", function (e) {
//
//             if (isTyping == false) {
//                 console.log("start typing");
//                 setTimeout(function () {
//                     editDocumentHub.server.startType(id).done(function () {
//                         isTyping = true;
//                     });
//
//                 }, 500);
//             }
//
//         });
//     }
//
//     editor.on("keydown change undo redo propertychange input", _.debounce(stopType, 5000, false));
//
//
//     $("#remark-input").on("keydown change undo redo propertychange input", _.debounce(stopType, 5000, false));
//
}























function indent() {
    //首行缩进功能实现
    var current = $(tinymce.activeEditor.selection.getStart());
    var end = $(tinymce.activeEditor.selection.getEnd());
    var elements = "P,UL,OL,H1,H2,H3,H4,H5,H6,TD";
    // 如果光标落在span, strong等element里面, 得到的node会是这些元素
    // 要往上面找到段落所在的元素进行整体调整
    while (elements.indexOf(current.prop("tagName")) < 0)
        current = current.parent();
    while (elements.indexOf(end.prop("tagName")) < 0)
        end = end.parent();

    var endLoop = false;
    while (current.length > 0 && end.length > 0 && !endLoop) {
        if (current.index() == end.index())
            endLoop = true;

        if (current.prop("tagName") == "UL" || current.prop("tagName") == "OL") {
            $("li", current).each(function () {
                if ($(this).html() != "") {
                    $(this).toggleClass("text-indent")
                }
            });
        }
        else if (current.html() != "") {
            current.toggleClass("text-indent")
        }
        current = current.next();
    }
}
//
function batchDeleteRemark() {
    startType();
    bootbox.confirm({
        message: '<span class="alertMessage"><i class=fa fa-question-circle></i>确定删除所有批注？该操作无法恢复</span>',
        buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i>否'
            },
            confirm: {
                label: '<i class="fa fa-check"></i>是'
            }
        },
        size: "small",
        callback: function (result) {
            if (result) {
                edit.find("em").each(function () {
                    var xx = $(this).html();
                    $(this).replaceWith(xx);
                });
                sendPatch();
                initRemark();
            }
            stopType();
        }
    });
}
//
// function loadOfficalTerm(id) {
//     $(".personal-term").load("/term/insertOfficalTerm?id=" + id);
// }
//
// function renderData(termtype) {
//     $.post('/Term/FindInternalTerms', 'termtype=' + termtype, function (res) {
//         var terms = "";
//         for (var i in res) {
//             var term = res[i];
//             if (term.Keyword != null) {
//                 var str = '<a href="javascript:void(0);" data-content="' + kendo.htmlEncode(term.Content) + '" data-id="' + term.Id + '" title="【' + term.Keyword + '】' + term.ContentText + '" class="btn-term btn btn-default" style="font-size:12px;width:82px;padding: 2px 4px;overflow: hidden;text-overflow:ellipsis;white-space: nowrap;margin:2px">' + term.Title + '</a>';
//             } else {
//                 var str = '<a href="javascript:void(0);" data-content="' + kendo.htmlEncode(term.Content) + '" data-id="' + term.Id + '" title="' + term.ContentText + '" class="btn-term btn btn-default" style="font-size:12px;width:82px;padding: 2px 4px;overflow: hidden;text-overflow:ellipsis;white-space: nowrap;margin:2px">' + term.Title + '</a>';
//             }
//
//             terms += str;
//         }
//         $(".personal-term").html(terms);
//     })
// }
//
// function insertPersonalTerm(id, content) {
//
//     tinymce.execCommand('mceInsertContent', false, content)
//
//
//     $.post("/term/useterm", "id=" + id, null);
//
// }
//
// function GetUserInfo() {
//     //获取当前用户信息
//     var res;
//     $.ajax({
//         type: "post",
//         dataType: 'json',
//         url: "/GetUserInfo",
//         async: false,
//         data: "username=" + $("input[name='username']").val()
//         , success: function (data) {
//             res = data;
//         }
//     });
//     return res;
// }
//
// function getNow() {
//     //获取当前时间
//     var now;
//     $.ajax({
//         type: "get",
//         dataType: 'json',
//         url: "/GetDateTime",
//         async: false,
//         success: function (res) {
//             var date = new Date(parseInt(res.Now.slice(6)));
//             function checkTime(i) {
//                 if (i < 10)
//                 { i = "0" + i }
//                 return i
//             }
//             var hours = checkTime(date.getHours());
//             var minutes = checkTime(date.getMinutes());
//             var result = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " " + hours + ":" + minutes;
//             now = result;
//         }
//     });
//     return now;
// }
//
// function getDocumentUsersInfo(userIds, documentId) {
//     //批量获取用户信息
//     var data = "users=" + userIds[0];
//     for (var i = 1; i < userIds.length; i++) {
//         var str = "&users=" + userIds[i];
//         data += str;
//     }
//     data += "&documentId=" + documentId;
//     var res;
//     $.ajax({
//         type: "post",
//         dataType: 'json',
//         url: "/GetDocumentUsersInfo",
//         async: false,
//         data: data
//         , success: function (data) {
//             res = data;
//         }
//     });
//     return res;
// }
//
// function initRemark() {
//     //清除所有没有子元素em的父元素（h2 h3 td p）的id
//     edit.find("b,strong,i,p,h1,h2,h3,table,tr,td,th,ul,li,ol,span").each(function () {
//         if ($(this).attr("id")) {
//             $(this).removeAttr("id");
//         }
//     });
//     //清除所有没有data-remark的em
//     edit.find("em").each(function () {
//         if (!$(this).attr("data-remark")) {
//             var xx = $(this).html();
//             $(this).replaceWith(xx);
//         }
//     });
//     //初始化清除所有的focushover
//     edit.find(".focus-hover").each(function () {
//         $(this).removeClass("focus-hover");
//     });
//
//     //初始化清除批注列表
//     $("#remark-tips").html("");
//     $("#remark-list").html("");
//     var usersIds = [];
//     edit.find(".focus").each(function () {
//         if ($(this).attr("data-remark")) {
//             var jsonArray = JSON.parse(Base64.decode($(this).attr("data-remark")));
//             for (var i in jsonArray) {
//                 var userId = jsonArray[i].user;
//                 usersIds.push(userId);
//             }
//         }
//     });
//     //获取用户信息
//     if (usersIds.length > 0) {
//         var usersInfo = getDocumentUsersInfo(usersIds, $("#Id").val());
//     }
//     edit.find("h2,h3,p,tr").each(function () {
//         if ($(this).find(".focus").length > 0) {
//             var tip = $('<span><i class="fa fa-commenting"></i></span>');
//             var sectionId = Math.uuid().toLowerCase();
//             var items = $('<div><div class=remark-items-header><button type="button" class="close" style="margin-right:5px;">×</button></div>');
//             tip.attr({
//                 "data-id": sectionId,
//                 "class": "tip-item"
//             });
//             tip.css({
//                 "top": $(this).offset().top,
//             });
//             $("#remark-tips").append(tip);
//             items.attr({
//                 "class": "remark-list-items shadow",
//                 "data-id": sectionId
//             });
//             items.css("top", $(this).offset().top);
//             $(this).find(".focus").each(function () {
//                 if ($(this).attr("data-remark")) {
//                     var jsonArray = JSON.parse(Base64.decode($(this).attr("data-remark")));
//                     var strSum = "";
//                     for (var i = 0; i < jsonArray.length; i++) {
//                         for (var j = 0; j < usersInfo.length; j++) {
//                             if (usersInfo[j].Id = jsonArray[i].user) {
//                                 if (usersInfo[j].Id != "00000000-0000-0000-0000-000000000000") {
//                                     var str = '<div class="feed-element doc-remark-item">\
//                                 <a href="/User/UserInfo?id=' + usersInfo[j].Id + '" class="pull-left">\
//                                 <img alt="image" class="img-circle doc-remark-avatar" src="'+ usersInfo[j].Avatar + '">\
//                                 </a>\
//                                 <div class="media-body ">\
//                                 <strong class="doc-remark-username">'+ usersInfo[j].Name + '</strong>\
//                                 <small class="text-muted doc-remark-time">'+ jsonArray[i].time + '</small>\
//                                 <div class="doc-remark-delete">\
//                                 <a>删除</a>\
//                                 </div>\
//                                 <div class="well">' + TransferString(jsonArray[i].content) + '</div>\
//                                 </div>\
//                                 </div>';
//                                 } else {
//                                     var str = '<div class="feed-element doc-remark-item">\
//                                 <a href="javascript:void(0;)" class="pull-left">\
//                                 <img alt="image" class="img-circle doc-remark-avatar" src="'+ usersInfo[j].Avatar + '">\
//                                 </a>\
//                                 <div class="media-body ">\
//                                 <strong class="doc-remark-username">'+ usersInfo[j].Name + '</strong>\
//                                 <small class="text-muted doc-remark-time">'+ jsonArray[i].time + '</small>\
//                                 <div class="doc-remark-delete">\
//                                 <a>删除</a>\
//                                 </div>\
//                                 <div class="well">' + TransferString(jsonArray[i].content) + '</div>\
//                                 </div>\
//                                 </div>';
//                                 }
//                                 strSum += str;
//                             }
//                         }
//                     }
//                     //测试样式
//                     strSum += '<div class="feed-element doc-remark-item doc-remark-input">\
// 				                    <a href="/User/UserInfo?Id=' + $("#UserId").val() + '" class="pull-left">\
// 				                    <img alt="image" class="img-circle doc-remark-avatar" src="' + $("input[name='avatar']").val() + '">\
// 				                    </a>\
// 				                    <div class="media-body ">\
//                                     <strong class="doc-remark-username">' + $("input[name='name']").val() + '</strong>\
// 				                    <textarea class="well list-input" type="text" contenteditable="true" placeholder="继续批注，按ctrl+enter提交" style="padding: 2px;display: block;margin: 10px 0;width: 190px;height: 60px;"  maxlength=500></textarea>\
//                                     <button type="button" class="submit-remark btn btn-default btn-xs  pull-right">提交</button>\
// 				                    </div>\
// 				                    </div>';
//                     var item = $("<div></div>");
//                     item.attr({
//                         "data-id": $(this).attr("data-id"),//data-id
//                         "class": "remark-list-item"
//                     });
//                     item.append(strSum);
//                     items.append(item);
//                 }
//             });
//             $("#remark-list").append(items);
//         }
//     });
// }
//
//
// function createJsonArray(content) {
//     var jsonArray = [];
//     //验证后以json形式保存
//     var jsonObj = {
//         'user': $("#UserId").val(),
//         'content': content,
//         'time': getNow()
//     };
//     jsonArray.push(jsonObj);
//     return jsonArray;
// }
//
// //提交批注
// $(document).on("click", ".submit-remark", function (event) {
//     event.stopPropagation();
//     var e = jQuery.Event("keyup");
//     e.keyCode = 13;
//     e.ctrlKey = true;
//     $(this).prev().trigger(e);
// });
//
// //点击批注按钮时出现批注输入框
// $(document).on("click", "#add-remark", function (e) {
//
//
//     e.stopPropagation();
//
//     if (editor.readonly == true)
//         return;
//
//
//     var selection = tinymce.activeEditor.selection.getContent();
//     mouseObj = $(mousepitch.commonAncestorContainer.parentElement);
//     var str = '<img class="doc-remark-avatar input-avatar" src="/Content/img/avatar.jpg" alt="">\
//         <textarea class="well doc-remark-input-content" type="text" contenteditable="true" placeholder="对文档进行批注，按ctrl+enter提交，最多500字" style="padding: 2px;display: block;margin: 10px 0;width: 190px;height: 60px;" maxlength=500></textarea>\
//         <button type="button" class="submit-remark btn btn-default btn-xs  pull-right">提交</button>';
//     $("#remark-input").html(str);
//     if (selection != "") {
//         var top = $("#add-remark").css("top");//批注图标top
//         $("#remark-input").css({
//             "top": top,
//             "display": "block",
//             "opacity": "1"
//         });
//     } else {
//         if (mouseObj.prop("tagName") == "P" || mouseObj.prop("tagName") == "LI") {
//             var top = $("#add-remark").css("top");
//             $("#remark-input").css({
//                 "top": top,
//                 "display": "block",
//                 "opacity": "1"
//             });
//             mouseObj.addClass("focus-hover");
//         } else {
//             var top = $("#add-remark").css("top");
//             $("#remark-input").css({
//                 "top": top,
//                 "display": "block",
//                 "opacity": "1"
//             });
//             mouseObj.parents("p").addClass("focus-hover");
//         }
//     }
//
// });
//
// //点击屏幕隐藏批注输入框
// $(document).on("click", "#remark-input,#add-remark", function (e) {
//     e.stopPropagation();
//
//     $(document).on("click", function () {
//
//         $("#remark-input").css("display", "none");
//     });
//     edit.on("click", function () {
//
//         $("#remark-input").css("display", "none");
//     });
//
//
// })
//
// // 点击批注列表时点亮批注列表
// $(document).on("click", "#remark-list .remark-list-items", function () {
//     $(this).addClass("remark-list-items-hover");
//     $(this).siblings().removeClass("remark-list-items-hover");
// });
//
// $(document).on("click", "#remark-list .remark-list-item", function () {
//     $(this).addClass("remark-list-item-hover");
//     $(this).siblings().removeClass("remark-list-item-hover");
//     $(this).parent().siblings().children().removeClass("remark-list-item-hover");
//     var emId = $(this).attr("data-id");
//     edit.find("em").removeClass("focus-hover");
//     edit.find("em[data-id='" + emId + "']").addClass("focus-hover");//data-id
// });
//
// //点击批注小图标时点亮批注列表
// //划过批注小图标时点亮批注列表
// $(document).on("click mouseover", "#remark-tips .tip-item", function () {
//     edit.find(".focus").each(function () { $(this).removeClass("focus-hover"); });
//     var sectionId = $(this).attr("data-id");
//     $(".remark-list-items").each(function () {
//         if ($(this).attr("data-id") == sectionId) {
//             var hoverItem = $(this);
//             $(this).addClass("remark-list-items-hover");
//             $(this).siblings().removeClass("remark-list-items-hover");
//             edit.find("p,h2,h3,tr,th").each(function () {
//                 if ($(this).find(".focus").length > 0) {
//                     if ($($(this).find(".focus")[0]).attr("data-id") == $(hoverItem.find(".remark-list-item")[0]).attr("data-id")) {
//                         $(this).find(".focus").addClass("focus-hover");
//                         return false;
//                     }
//                 }
//             });
//         }
//     });
// });
//
//
// //输入框输入批注事件
// $(document).on("keyup", "#remark-input .doc-remark-input-content", function (event) {
//     event.stopPropagation();
//
//     startType();
//
//     var selection = tinymce.activeEditor.selection.getContent();
//     var content = kendo.htmlEncode($(this).val());
//     if (event.ctrlKey && event.keyCode == 13) {
//         event.preventDefault();
//         if (content != "") {
//             if (content.length <= 500) {
//                 var remarkItem = '<div class="feed-element doc-remark-item">\
// 				                                        <a href="/User/UserInfo?id=' + $("#UserId").val() + '" class="pull-left">\
// 				                                        <img alt="image" class="img-circle doc-remark-avatar" src="' + $("input[name='avatar']").val() + '">\
// 				                                        </a>\
// 				                                        <div class="media-body ">\
// 				                                        <strong class="doc-remark-username">'+ $("input[name='name']").val() + '</strong>\
// 				                                        <small class="text-muted doc-remark-time">' + getNow() + '</small>\
// 				                                        <div class="doc-remark-delete">\
// 				                                        <a>删除</a>\
// 				                                        </div>\
// 				                                        <div class="well">' + TransferString(content) + '</div>\
// 				                                        </div>\
// 				                                        </div>';
//                 var inputItem = '<div class="feed-element doc-remark-item doc-remark-input">\
// 				                                    <a href="/User/UserInfo?id=' + $("#UserId").val() + '" class="pull-left">\
// 				                                    <img alt="image" class="img-circle doc-remark-avatar" src="' + $("input[name='avatar']").val() + '">\
// 				                                    </a>\
// 				                                    <div class="media-body ">\
//                                                     <strong class="doc-remark-username">' + $("input[name='name']").val() + '</strong>\
// 				                                    <textarea class="well list-input" type="text" contenteditable="true" placeholder="继续批注，按ctrl+enter提交，最多500字" style="padding: 2px;display: block;margin: 10px 0;width: 190px;height: 60px;"  maxlength=500></textarea>\
//                                                     <button type="button" class="submit-remark btn btn-default btn-xs  pull-right">提交</button>\
// 				                                    </div>\
// 				                                    </div>';
//                 var dataId = Math.uuid().toLowerCase();
//                 var jsonArray = createJsonArray(content);
//                 var item = $("<div></div>");
//                 item.attr({
//                     "data-id": dataId,
//                     "class": "remark-list-item"
//                 });
//                 item.append(remarkItem);
//                 item.append(inputItem);
//                 if (selection != "") {
//                     //有选中内容
//                     tinymce.activeEditor.selection.setContent("<em data-id='" + dataId + "' class='focus focus-hover' data-remark='" + Base64.encode(JSON.stringify(jsonArray)) + "'>" + selection + "</em>");
//                     var selectionParent = $(tinymce.activeEditor.selection.getNode());
//                     //console.log(selectionParent.closest("tr").length)
//                     if (selectionParent.closest("tr").length < 1) {
//                         if (selectionParent.find(".focus").length < 2) {
//                             //本段无批注
//                             var sectionId = Math.uuid().toLowerCase();
//                             var items = $('<div><div class=remark-items-header><button type="button" class="close" style="margin-right:5px;">×</button></div>');
//                             var tip = $('<span><i class="fa fa-commenting"></i></span>');
//                             items.attr({
//                                 "class": "remark-list-items shadow remark-list-items-hover",
//                                 "data-id": sectionId
//                             });
//                             items.css("top", selectionParent.offset().top);
//                             tip.attr({
//                                 "data-id": sectionId,
//                                 "class": "tip-item"
//                             });
//                             tip.css({
//                                 "top": selectionParent.offset().top,
//                             });
//                             $("#remark-tips").append(tip);
//                             items.append(item);
//                             $("#remark-list").append(items);
//                         } else {
//                             //本段有批注
//                             selectionParent.find(".focus").each(function () {
//                                 var emId = $(this).attr("data-id");
//                                 $(".remark-list-item").each(function () {
//                                     if ($(this).attr("data-id") == emId) {
//                                         var items = $(this).parent();
//                                         items.append(item);
//                                         $("#remark-list").append(items);
//                                         return false;
//                                     }
//                                 });
//                             });
//                         }
//                     } else {
//                         if (selectionParent.closest("tr").find(".focus").length < 1) {
//                             //本段无批注
//                             var sectionId = Math.uuid().toLowerCase();
//                             var items = $('<div><div class=remark-items-header><button type="button" class="close" style="margin-right:5px;">×</button></div>');
//                             var tip = $('<span><i class="fa fa-commenting"></i></span>');
//                             items.attr({
//                                 "class": "remark-list-items shadow remark-list-items-hover",
//                                 "data-id": sectionId
//                             });
//                             items.css("top", selectionParent.closest("tr").offset().top);
//                             tip.attr({
//                                 "data-id": sectionId,
//                                 "class": "tip-item"
//                             });
//                             tip.css({
//                                 "top": selectionParent.closest("tr").offset().top,
//                             });
//                             $("#remark-tips").append(tip);
//                             items.append(item);
//                             $("#remark-list").append(items);
//                         } else {
//                             //本段有批注
//                             selectionParent.closest("tr").find(".focus").each(function () {
//                                 var emId = $(this).attr("data-id");
//                                 $(".remark-list-item").each(function () {
//                                     if ($(this).attr("data-id") == emId) {
//                                         var items = $(this).parent();
//                                         items.append(item);
//                                         $("#remark-list").append(items);
//                                         return false;
//                                     }
//                                 });
//                             });
//                         }
//                     }
//
//                     //移除事件
//                     $(this).unbind();
//                 } else {
//                     //没有选中内容
//                     mouseObj = $(mousepitch.commonAncestorContainer.parentElement);
//                     var html = mouseObj.html();
//                     if (mouseObj.closest("tr").length < 1) {
//                         if (mouseObj.find(".focus").length < 2) {
//                             //本段无批注
//                             var sectionId = Math.uuid().toLowerCase();
//                             var items = $('<div><div class=remark-items-header><button type="button" class="close" style="margin-right:5px;">×</button></div>');
//                             var tip = $('<span><i class="fa fa-commenting"></i></span>');
//                             items.attr({
//                                 "class": "remark-list-items shadow remark-list-items-hover",
//                                 "data-id": sectionId
//                             });
//                             items.css("top", mouseObj.offset().top);
//                             tip.attr({
//                                 "data-id": sectionId,
//                                 "class": "tip-item"
//                             });
//                             tip.css({
//                                 "top": mouseObj.offset().top,
//                             });
//                             $("#remark-tips").append(tip);
//                             items.append(item);
//                             $("#remark-list").append(items);
//                         } else {
//                             mouseObj.find(".focus").each(function () {
//                                 var emId = $(this).attr("data-id");
//                                 $(".remark-list-item").each(function () {
//                                     if ($(this).attr("data-id") == emId) {
//                                         var items = $(this).parent();
//                                         items.append(item);
//                                         $("#remark-list").append(items);
//                                         return false;
//                                     }
//                                 });
//                             });
//                         }
//                     } else {
//                         if (mouseObj.closest("tr").find(".focus").length < 1) {
//                             //本段无批注
//                             var sectionId = Math.uuid().toLowerCase();
//                             var items = $('<div><div class=remark-items-header><button type="button" class="close" style="margin-right:5px;">×</button></div>');
//                             var tip = $('<span><i class="fa fa-commenting"></i></span>');
//                             items.attr({
//                                 "class": "remark-list-items shadow remark-list-items-hover",
//                                 "data-id": sectionId
//                             });
//                             items.css("top", mouseObj.closest("tr").offset().top);
//                             tip.attr({
//                                 "data-id": sectionId,
//                                 "class": "tip-item"
//                             });
//                             tip.css({
//                                 "top": mouseObj.closest("tr").offset().top,
//                             });
//                             $("#remark-tips").append(tip);
//                             items.append(item);
//                             $("#remark-list").append(items);
//                         } else {
//                            mouseObj.closest("tr").find(".focus").each(function () {
//                                 var emId = $(this).attr("data-id");
//                                 $(".remark-list-item").each(function () {
//                                     if ($(this).attr("data-id") == emId) {
//                                         var items = $(this).parent();
//                                         items.append(item);
//                                         $("#remark-list").append(items);
//                                         return false;
//                                     }
//                                 });
//                             });
//                         }
//                     }
//                     mouseObj.html("<em data-id='" + dataId + "' class='focus focus-hover'  data-remark='" + Base64.encode(JSON.stringify(jsonArray)) + "'>" + html + "</em>");
//                     mouseObj.removeClass("focus-hover");
//                     $(this).unbind();
//                 }
//                 $("#add-remark").css("display", "none");
//                 $("#remark-input").css("display", "none");
//                 $("#remark-input div").text("");
//                 sendPatch();
//
//                 //释放输入
//                 stopType();
//
//                 $(this).unbind();
//
//
//             } else {
//                 warningAlert("字数不能超过500");
//             }
//         } else {
//             warningAlert("不能添加空白批注");
//         }
//     }
//
// });
// //列表输入批注事件
// $(document).on("keyup", "#remark-list .list-input", function (event) {
//
//     if (event.ctrlKey && event.keyCode == 13) {
//         event.preventDefault();
//         if ($(this).val() != "") {
//             if ($(this).val().length <= 500) {
//                 var content = kendo.htmlEncode($(this).val());
//                 var emId = $(this).parent().parent().parent().attr("data-id");
//                 var jsonArray = JSON.parse(Base64.decode(edit.find("em[data-id='" + emId + "']").attr("data-remark")));
//                 //验证后以json形式保存
//                 var jsonObj = {
//                     'user': $("#UserId").val(),
//                     'content': content,
//                     'time': getNow()
//                 };
//                 jsonArray.push(jsonObj);
//                 var remarkItem = '<div class="feed-element doc-remark-item">\
// 				                                <a href="/User/UserInfo?id=' + $("#UserId").val() + '" class="pull-left">\
// 				                                <img alt="image" class="img-circle doc-remark-avatar" src="' + $("input[name='avatar']").val() + '">\
// 				                                </a>\
// 				                                <div class="media-body ">\
// 				                                <strong class="doc-remark-username">'+ $("input[name='name']").val() + '</strong>\
// 				                                <small class="text-muted doc-remark-time">' + getNow() + '</small>\
// 				                                <div class="doc-remark-delete">\
// 				                                <a>删除</a>\
// 				                                </div>\
// 				                                <div class="well">' + TransferString(content) + '</div>\
// 				                                </div>\
// 				                                </div>';
//                 $(this).parent().parent().prev().after(remarkItem);
//                 edit.find("em[data-id='" + emId + "']").attr("data-remark", Base64.encode(JSON.stringify(jsonArray)));
//                 $(this).val("");
//                 $("#add-remark").css("display", "none");
//                 $("#remark-input").css("display", "none");
//
//
//                 sendPatch();
//
//                 //释放输入
//
//                 stopType();
//
//
//
//                 //移除事件
//                 $(this).unbind();
//
//
//             } else {
//                 warningAlert("字数不能超过500");
//             }
//         } else {
//             warningAlert("不能添加空白批注");
//         }
//     }
//
// });
//
// //删除批注事件
// //手动删除
// //（添加选择）
// $(document).on("click", "#remark-list .doc-remark-delete", function () {
//     var element = $(this).parent().parent();
//     var item = $(this).parent().parent().parent();
//     var items = item.parent();
//     var emId = item.attr("data-id");
//     var jsonArray = JSON.parse(Base64.decode(edit.find("em[data-id='" + emId + "']").attr("data-remark")));
//     var i = $(this).parent().parent().index();
//     var sectionId = items.attr("data-id");
//
//     startType();
//     bootbox.confirm({
//         message: '<span class="alertMessage"><i class=fa fa-question-circle></i>确定删除该批注吗？</span>',
//         buttons: {
//             cancel: {
//                 label: '<i class="fa fa-times"></i>否'
//             },
//             confirm: {
//                 label: '<i class="fa fa-check"></i>是'
//             }
//         },
//         size: "small",
//         callback: function (result) {
//             if (result) {
//                 element.remove();
//                 jsonArray.splice(i, 1);
//                 edit.find("em[data-id='" + emId + "']").attr("data-remark", Base64.encode(JSON.stringify(jsonArray)));
//                 if (jsonArray.length == 0) {
//                     var xx = edit.find("em[data-id='" + emId + "']").html();
//                     edit.find("em[data-id='" + emId + "']").replaceWith(xx);
//                     item.remove();
//                 }
//                 //删除列表框
//                 if (items.children().length == 1) {
//                     //删除批注小图标
//                     $(".tip-item").each(function () {
//                         if ($(this).attr("data-id") == sectionId) {
//                             var tip = $(this);
//                             tip.remove();
//                         }
//                     });
//                     items.remove();
//                 }
//                 sendPatch();
//             }
//             stopType();
//         }
//     });
//
//
//
// });
//
// //点击关闭按钮关闭批注
// $(document).on("click", "#remark-list .close", function (e) {
//     e.stopPropagation();
//     $(this).parent().parent().removeClass("remark-list-items-hover");
//     edit.find("em").each(function () {
//         $(this).removeClass("focus-hover");
//     });
// });
//
//
//
//
// $.fn.editable.defaults.onblur = "submit";
// $('#title').editable({
//     "emptytext": "无",
//     "mode": 'inline',
//     "showbuttons": false,
//     inputclass: 'input_title',
//     success: function (response) {
//
//
//         if (response.Success === false) {
//             return response.Message;
//         }
//     }
// });
//
//
// var isPublished = $("#IsPublished").val() == "False" ? false : true;
//
//
// $(function () {
//
//     //function scrollTopShadow() {
//     //    if ($(window).scrollTop() > 20) {
//     //        $(".doc-header").css("box-shadow", "0 1px 1px 1px #ddd");
//     //    } else {
//     //        $(".doc-header").css("box-shadow", "none");
//     //    }
//     //}
//
//     //$(window).scroll(function (event) {
//     //    scrollTopShadow();
//     //});
//
//     //回到顶部底部事件
//     $(".fa-angle-up").parent().off("click").on("click", function () {
//         $(".fa-angle-down").parent().css("visibility", "visible");
//         $('#edit-scroller').scrollTop(0);
//     });
//     $(".fa-angle-down").parent().off("click").on("click", function () {
//         $(".fa-angle-up").parent().css("visibility", "visible");
//         $('#edit-scroller').scrollTop(100000);
//     });
//     $('#edit-scroller').scroll(function () {
//         if ($('#edit-scroller').scrollTop() == 0) {
//             $(".fa-angle-up").parent().css("visibility", "hidden");
//         } else {
//             $(".fa-angle-up").parent().css("visibility", "visible");
//             $(".fa-angle-down").parent().css("visibility", "visible");
//         }
//     });
//
//     $("#chat-content").load("chat");
//     $('.open-small-chat').click(function () {
//         $(this).children().toggleClass('fa-comments').toggleClass('fa-remove');
//         $('.small-chat-box').toggleClass('active');
//         loadChat();
//     });
//
//     $("#chatHistory").click(function () {
//         //console.log("chat")
//         $("#editModalLg .modal-content").load("/document/documentChatHistory?id=" + $("#Id").val());
//         $("#editModalLg").modal("show");
//     });
//
// });
//
// function templatePort(documentId) {
//
//     $('#editModalLg').modal('show');
//     $("#editModalLg .modal-content").load("/TemplateRequest/SearchTemplateFile3?documentId=" + documentId);
//
// }
//
// function copy(id, title) {
//     $('#editModal').modal('show');
//     $("#editModal .modal-content").load("/document/Copy?Id=" + id + "&name=" + escape(title));
// }
//
// //$("#share").click(function (e) {
// //    showPlugin($(".share-container"), 0);
// //    $(".share-container .popover-content").load("/document/ShareLink?Id=" + $('#Id').val(), function () {
// //        $(".share-container .plugin-content").eq(0).show().siblings().hide();
// //        getRecentlyCollaborators(id);
// //    });
// //    e.stopPropagation();
// //    toggleContainer($(".share-container"), $(".collab-container"));
// //});
// //$("#collab").click(function (e) {
// //    $.ajaxSetup({ cache: false });
// //    e.stopPropagation();
// //    toggleContainer($(".collab-container"), $(".share-container"));
// //    $(".collab-container .popover-content").load("/document/ControlCollaborators?Id=" + $("#Id").val(), function () {
// //        getCollaborators($('#Id').val(), true);
// //    });
// //});
//
// $('#collabmenu a').on('click', function (event) {
//     $(this).parent().toggleClass('open');
//     $(".collab-container .popover-content").load("/document/ControlCollaborators?Id=" + $("#Id").val(), function () {
//         getCollaborators($('#Id').val(), true);
//     });
//     $('#sharemenu').removeClass('open');
// });
//
// $('#sharemenu a').on('click', function (event) {
//     $(this).parent().toggleClass('open');
//     $(".share-container .popover-content").load("/document/ShareLink?Id=" + $('#Id').val(), function () {
//         showPlugin($(".share-container"),0);
//         getRecentlyCollaborators(id);
//     });
//     $('#collabmenu').removeClass('open');
// });
//
// //点击关闭popup窗口
// $('body').on('click', function (e) {
//     if (!$('#collabmenu').is(e.target)
//         && $('#collabmenu').has(e.target).length === 0
//         && $('.open').has(e.target).length === 0
//         && !$(e.target).hasClass("k-state-selected")
//     ) {
//         $('#collabmenu').removeClass('open');
//         $(".k-animation-container").each(function () {
//             $(this).remove();
//         });
//         $(".k-list-container").each(function () {
//             $(this).remove();
//         });
//     }
//
//
//     if (!$('#sharemenu').is(e.target)
//         && $('#sharemenu').has(e.target).length === 0
//         && $('.open').has(e.target).length === 0
//         && !$(e.target).hasClass("k-state-selected")
//     ) {
//         $('#sharemenu').removeClass('open');
//         $(".k-animation-container").each(function () {
//             $(this).remove();
//         });
//         $(".k-list-container").each(function () {
//             $(this).remove();
//         });
//     }
// });
//
// $(".share-container").on("click", "#findUserBtn", function (e) {
//     e.stopPropagation();
//     findUser($("#Id").val());
// });
//
// $(".share-container").on("click", "#createLink", function (e) {
//     e.stopPropagation();
//     createShareLink($("#Id").val(), parentShared);
// });
//
// $(".share-container").on("keyup", "#finduser", function (e) {
//     e.stopPropagation();
//     if (e.keyCode == 13) {
//         findUser($("#Id").val());
//     }
// });
//
//
// function download(id) {
//     window.location = "/document/DownloadDocument?id=" + id;
// }
//
// function emailto(documentId) {
//     $('#editModal').modal('show');
//     $("#editModal .modal-content").load("/Document/ExportToEmail?documentId=" + documentId);
// }
//
//
//
// function once(fn, context) {
//     var res;
//
//     return function () {
//         if (fn) {
//             res = fn.apply(context || this, arguments);
//             fn = null;
//         }
//
//         return res;
//     };
// }
//
// var loadChat = once(function () {
//     $('.chat-content').slimScroll({
//         height: ($("#chat-content").height() - 49) + "px",
//         railOpacity: 0.4,
//         start: "bottom",
//         scrollTo: $('#messagelistView').height()
//     });
//     $(".slimScrollBar").css({ "top": ($("#chat-content").height() - 45 - $(".slimScrollBar").height()) });
// });
//
// var loadPlugin = once(function () {
//     showPlugin($(".plugin-area"), 0);
// });
//
// //$(".plugin-area").width($("body").width() - 1000);
// $(".plugin-area").show();
//
// $(".share-container").on("click", ".plugin-tab", function () {
//     var index = $(this).data("index");
//     showPlugin($(".share-container"), index);
// });
//
// $(".plugin-area").on("click", ".plugin-tab", function () {
//     var index = $(this).data("index");
//     showPlugin($(".plugin-area"), index);
// });
//
// function showPlugin(parent, index) {
//     //if (index == -1) {
//     //    parent.find(".plugin-tab").eq(0).addClass("plugin-tab-active").siblings().removeClass("plugin-tab-active");
//     //    parent.find(".plugin-content").eq(0).show().siblings().hide();
//     //    if (parent.find(".plugin-content").eq(0).data("href")) {
//     //        parent.find(".plugin-content").eq(0).load(parent.find(".plugin-content").eq(0).data("href"));
//     //    }
//     //} else {
//         parent.find(".plugin-tab").each(function () {
//             if ($(this).data("index") == index) {
//                 $(this).addClass("plugin-tab-active").siblings().removeClass("plugin-tab-active");
//             }
//         });
//         parent.find(".plugin-content").each(function () {
//             if ($(this).data("index") == index) {
//                 $(this).show().siblings().hide();
//                 if ($(this).data("href")) {
//                     $(this).load($(this).data("href"));
//                 }
//             }
//         });
//     //}
// }
//
// function setCookie(name, value, time) {
//     var exp = new Date();
//     exp.setTime(exp.getTime() + time * 24 * 60 * 60 * 1000);
//     document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
// }
//
// function getCookie(name) {
//     var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
//     if (arr = document.cookie.match(reg)) {
//         return unescape(arr[2]);
//     }
//     else {
//         return null;
//     }
// }
//
// function delCookie(name) {
//     var exp = new Date();
//     exp.setTime(exp.getTime() - 1);
//     var cval = getCookie(name);
//     if (cval != null) {
//         document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
//     }
// }
//
// //初始化插件配置
// function initPlugin() {
//         var index = -1;
//     if (getCookie("library-plugin") != "false") {
//         var result = createPlugin(0, '合同库', '/template/TemplatesLibrary');
//         if ($(".plugin-area .plugin-tab").length != 0) {
//             if ($(".plugin-area .plugin-tab[data-index=0]").length == 0) {
//                 $(".plugin-area .plugin-tab").eq(0).before(result.tab);
//                 $(".plugin-area .plugin-content").eq(0).before(result.content);
//             }
//         } else {
//             $(".plugin-area .plugin-tabs").append(result.tab);
//             $(".plugin-area .plugin-container").append(result.content);
//         }
//         index++;
//         $(".mce-text").each(function () {
//             if ($(this).text() == "合同库") {
//                 $(this).closest("div").removeClass("mce-menu-item-normal").addClass("mce-menu-item-checkbox").addClass("mce-active");
//             }
//         })
//     } else {
//         $(".plugin-area .plugin-tab[data-index=0]").remove();
//         $(".plugin-area .plugin-content[data-index=0]").remove();
//         $(".mce-text").each(function () {
//             if ($(this).text() == "合同库") {
//                 $(this).closest("div").addClass("mce-menu-item-normal").removeClass("mce-menu-item-checkbox").removeClass("mce-active");
//             }
//         })
//     }
//     if (getCookie("term-plugin") != "false") {
//         var result = createPlugin(1, '条款库', '/term/insertOfficalTerm');
//         if ($(".plugin-area .plugin-tab").length != 0) {
//             if ($(".plugin-area .plugin-tab[data-index=1]").length == 0) {
//                 $(".plugin-area .plugin-tab").eq(index).after(result.tab);
//                 $(".plugin-area .plugin-content").eq(index).after(result.content);
//             }
//         } else {
//             $(".plugin-area .plugin-tabs").append(result.tab);
//             $(".plugin-area .plugin-container").append(result.content);
//         }
//         index++;
//         $(".mce-text").each(function () {
//             if ($(this).text() == "条款库") {
//                 $(this).closest("div").removeClass("mce-menu-item-normal").addClass("mce-menu-item-checkbox").addClass("mce-active");
//             }
//         })
//     } else {
//         $(".plugin-area .plugin-tab[data-index=1]").remove();
//         $(".plugin-area .plugin-content[data-index=1]").remove();
//         $(".mce-text").each(function () {
//             if ($(this).text() == "条款库") {
//                 $(this).closest("div").addClass("mce-menu-item-normal").removeClass("mce-menu-item-checkbox").removeClass("mce-active");
//             }
//         })
//     }
//     if (getCookie("myterm-plugin") != "false") {
//         var result = createPlugin(2, '我的条款', '/term/insertPersonalTerm');
//         if ($(".plugin-area .plugin-tab").length != 0) {
//             if ($(".plugin-area .plugin-tab[data-index=2]").length == 0) {
//                 $(".plugin-area .plugin-tab").eq(index).after(result.tab);
//                 $(".plugin-area .plugin-content").eq(index).after(result.content);
//             }
//         } else {
//             $(".plugin-area .plugin-tabs").append(result.tab);
//             $(".plugin-area .plugin-container").append(result.content);
//         }
//         index++;
//         $(".mce-text").each(function () {
//             if ($(this).text() == "我的条款") {
//                 $(this).closest("div").removeClass("mce-menu-item-normal").addClass("mce-menu-item-checkbox").addClass("mce-active");
//             }
//         })
//     } else {
//         $(".plugin-area .plugin-tab[data-index=2]").remove();
//         $(".plugin-area .plugin-content[data-index=2]").remove();
//         $(".mce-text").each(function () {
//             if ($(this).text() == "我的条款") {
//                 $(this).closest("div").addClass("mce-menu-item-normal").removeClass("mce-menu-item-checkbox").removeClass("mce-active");
//             }
//         })
//     }
//     if (getCookie("mydocument-plugin") != "false") {
//         var result = createPlugin(3, '我的文件', '/document/mydocuments');
//         if ($(".plugin-area .plugin-tab").length != 0) {
//             if ($(".plugin-area .plugin-tab[data-index=3]").length == 0) {
//                 $(".plugin-area .plugin-tab").eq(index).after(result.tab);
//                 $(".plugin-area .plugin-content").eq(index).after(result.content);
//             }
//         } else {
//             $(".plugin-area .plugin-tabs").append(result.tab);
//             $(".plugin-area .plugin-container").append(result.content);
//         }
//         index++;
//         $(".mce-text").each(function () {
//             if ($(this).text() == "我的文件") {
//                 $(this).closest("div").removeClass("mce-menu-item-normal").addClass("mce-menu-item-checkbox").addClass("mce-active");
//             }
//         })
//     } else {
//         $(".plugin-area .plugin-tab[data-index=3]").remove();
//         $(".plugin-area .plugin-content[data-index=3]").remove();
//         $(".mce-text").each(function () {
//             if ($(this).text() == "我的文件") {
//                 $(this).closest("div").addClass("mce-menu-item-normal").removeClass("mce-menu-item-checkbox").removeClass("mce-active");
//             }
//         })
//     }
//     //$(".plugin-area .plugin-tabs").width(100 / $(".plugin-area .plugin-tab").length + "%");
//     loadPlugin();
// }
//
// function createPlugin(index, name, href) {
//     console.log(2222)
//     var str1 = '<div class="plugin-tab" data-index="' + index + '">' + name + '</div>';
//     if (href != '') {
//         var str2 = '<div class="plugin-content" data-index="' + index + '" data-href="' + href + '?id=' + 1 + '"></div>';
//     } else {
//         var str2 = '<div class="plugin-content" data-index="' + index + '"></div>';
//     }
//
//     var result = {
//         "tab": str1,
//         "content": str2
//     }
//     return result;
// }


