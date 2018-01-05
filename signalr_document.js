//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
var editDocumentHub = $.connection.editDocumentHub;
var textPrev = '';
var textNext = '';
var canSendPatch = false;
var patchIndex = 0;



var isIE = navigator.userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1;
var isEdge = navigator.userAgent.toLowerCase().indexOf("edge") > -1 && !isIE;


//hub启动
$.connection.hub.logging = true;

// Start the connection.
$.connection.hub.start().done(function () {

    console.log("connection start")

    editDocumentHub.server.joinDocument($('#Id').val()).done(function (bool) {
        if (bool) {
            console.log("join document")
            canSendPatch = true;
        }

    });


});

$.connection.hub.error(function (error) {
    console.log(error)

});

$.connection.hub.connectionSlow(function () {
    console.log("网络连接不稳定")

    //canSendPatch = false;
    //if ($('.bootbox').hasClass('in') == false) {
    //    bootbox.dialog({ message: '<div class="text-center"><i class="fa fa-spin fa-spinner"></i>  您的网络不稳定，正在尝试重新连接...</div>', closeButton: false });
    //}
});


//重连提示
$.connection.hub.reconnecting(function () {

    console.log("无法连接服务器")
    canSendPatch = false;
    if ($('.bootbox').hasClass('in') == false) {
        bootbox.dialog({ message: '<div class="text-center"><i class="fa fa-spin fa-spinner"></i>  您的网络不稳定，正在尝试重新连接...</div>', closeButton: false });
    }
});

//断开重连
$.connection.hub.disconnected(function () {
    toastr.warning("无法连接服务器，5秒后将尝试重新连接！");
    setTimeout(function () {
        console.log("尝试重新连接服务器")
        $.connection.hub.start().done(function () {
            editDocumentHub.server.joinDocument($('#Id').val()).done(function (bool) {
                if (bool) {
                    toastr.success("服务器重新连接成功！");
                    canSendPatch = true;

                    if ($('.bootbox').hasClass('in') == true) {
                        bootbox.hideAll()
                    }
                }

            });
        });
    }, 5000);
});

//重连成功
$.connection.hub.reconnected(function () {
    console.log("reconnected")
    $.connection.hub.start().done(function () {
        editDocumentHub.server.joinDocument($('#Id').val()).done(function (bool) {
            if (bool) {
                toastr.success("服务器重新连接成功！");
                canSendPatch = true;
            }

        });
    });
});


//==============================================================================================================================================//

function sendPatch() {

    if (canSendPatch == false) {
        return;
    }
    console.log("sending patch ...");

    textNext = tinymce.get("edit-me").getContent();
    if (textNext != textPrev) {
        canSendPatch = false;
        var dmp = new diff_match_patch();
        var patcher = dmp.patch_make(textPrev, textNext);

        editDocumentHub.server.sendPatch($('#Id').val(), patcher, patchIndex).done(function (bool) {
            console.log("result:" + bool);
            if (bool) {
                textPrev = textNext;
                canSendPatch = true;
                patchIndex++;
                console.log("index:" + patchIndex);
                $(".saveinfo").html('保存中 <span class="dot">...</span>');
                var hideInfo = setInterval(function () {
                    $(".saveinfo").text("");
                    clearInterval(hideInfo);
                }, 1500);
            }

        }).fail(function (e) {
            canSendPatch = true;
            console.log(e)
        });
    }
}


function rollback() {

    if (canSendPatch == false) {

        warningAlert("请等待其他用户停止输入后再执行此操作！");

        return;
    }



    var versionContent = $("#VersionContent").html();

    tinymce.get("edit-me").setContent(versionContent);

    textNext = tinymce.get("edit-me").getContent();


    textNext = tinymce.get("edit-me").getContent();
    if (textNext != textPrev) {

        showLoading();

        canSendPatch = false;
        var dmp = new diff_match_patch();
        var patcher = dmp.patch_make(textPrev, textNext);

        editDocumentHub.server.sendPatch($('#Id').val(), patcher, patchIndex).done(function (bool) {
            console.log("result:" + bool);
            if (bool) {
                textPrev = textNext;
                canSendPatch = true;
                patchIndex++;
                console.log("index:" + patchIndex);
                $(".saveinfo").html('保存中 <span class="dot">...</span>');
                var hideInfo = setInterval(function () {
                    $(".saveinfo").text("");
                    clearInterval(hideInfo);
                }, 1500);

                hideLoading();

                $(".modal").each(function () {

                    if ($(this).is(':visible')) {
                        $(this).modal('hide');
                    }


                })
            }

        }).fail(function (e) {
            canSendPatch = true;
            console.log(e)
        });
    }
    else {
        warningAlert("文档内容没有发生变化，无需恢复！");
    }

}




//初始化内容
editDocumentHub.client.applyContent = function (content, index, message) {
    tinymce.get("edit-me").setContent(content);
    tinymce.get("edit-me").undoManager.clear();
    textPrev = content;
    patchIndex = index;
    initRemark();
    console.log("initial index:" + index);
    if (message)
        disableType(message);
    hideLoading();

}


//应用补丁
editDocumentHub.client.applyPatch = function (patch, index) {
    var dmp = new diff_match_patch();
    result = dmp.patch_apply(patch, textPrev);
    tinymce.get("edit-me").setContent(result[0]);
    textPrev = result[0];
    console.log("apply patch");
    console.log("index:" + index);
    patchIndex = index;
}

//开启聊天功能
editDocumentHub.client.notification = function (message) {
    if (parentShared == "True") {
        toastr.success(message);
    }
}

editDocumentHub.client.warning = function (message) {
    toastr.warning(message);
}


//强行退出其他用户
editDocumentHub.client.exit = function () {


    if ($('.bootbox').hasClass('in') == false) {
        bootbox.dialog({ message: '<div class="text-center">您的网络不稳定，已断开服务器连接，就刷新页面重新进入文档！</div>', closeButton: false });
        console.log("exit")
    }


}

editDocumentHub.client.changeOperation = function () {
    bootbox.alert({
        size: "small",
        title: "",
        message: '<span class="alertMessage"><i class=fa fa-warning></i>  您的权限已经被修改！<span>',
        closeButton: false,
        callback: function () {
            location.reload(true);
        }
    });
}

editDocumentHub.client.closeShare = function () {
    editor.setMode('readonly');
    showLoading();
    bootbox.alert({
        size: "small",
        title: "",
        message: '<span class="alertMessage"><i class=fa fa-warning></i>  当前共享已被关闭！<span>',
        closeButton: false,
        callback: function () {
            window.location.href = "/Document/Index"
        }
    });
}

editDocumentHub.client.removeUser = function () {
    editor.setMode('readonly');
    showLoading();
    bootbox.alert({
        size: "small",
        title: "",
        message: '<span class="alertMessage"><i class=fa fa-warning></i>  您已被移出共享！<span>',
        closeButton: false,
        callback: function () {
            window.location.href = "/Document/Index"
        }
    });
}

editDocumentHub.client.clientEnableType = function () {
    initRemark();
    enableType();
}

editDocumentHub.client.clientDisableType = function (message) {

    disableType(message);

}

function enableType() {

    $(".saveinfo").html("");
    $(".edit-shade p").html("");

    canSendPatch = true;

    editor.setMode('design');

    $(".submit-remark").show();
    $(".doc-remark-delete").show();
}

function disableType(message) {

    $(".saveinfo").html(message + '<span class="dot">...</span>');
    canSendPatch = false;

    editor.setMode('readonly');

    $(".doc-remark-input").hide();
    $(".doc-remark-delete").hide();
}

///输入状态
var isTyping = false;


function stopType() {
    console.log("stop typing")
    editDocumentHub.server.stopType(id).done(function () {
        isTyping = false;
    })
}

function startType() {
    if (isTyping == false) {
        console.log("start typing");
        editDocumentHub.server.startType(id).done(function () {
            isTyping = true;
        });
    }
}




//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//

