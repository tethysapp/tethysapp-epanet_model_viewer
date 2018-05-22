/*****************************************************************************
 * FILE:    Main
 * DATE:    2/7/2018
 * AUTHOR:  Tylor Bayer
 * COPYRIGHT: (c) 2018 Brigham Young University
 * LICENSE: BSD 2-Clause
 *****************************************************************************/

/*****************************************************************************
 *                      LIBRARY WRAPPER
 *****************************************************************************/
(function packageEPANETModelViewer() {

    "use strict"; // And enable strict mode for this library

    /************************************************************************
     *                      MODULE LEVEL / GLOBAL VARIABLES
     *************************************************************************/
    let showLog,
        s,
        model,
        file_text,
        curNode,
        curEdge,
        graphColors = {
            Junction: '#666',
            Vertex: "#666",
            Reservoir: '#5F9EA0',
            Tank: '#8B4513',
            Pipe: '#808080',
            Pump: '#DAA520',
            Valve: '#3333cc' };

    //  *********FUNCTIONS***********
    let addInitialEventListeners,
        generateModelList,
        initializeJqueryVariables,
        openInitialModel,
        hideMainLoadAnim,
        setStateAfterLastModel,
        addLogEntry,
        showLoadingCompleteStatus,
        addModelToUI,
        addMetadataToUI,
        resetModelState,
        resetUploadState,
        populateModelOptions,
        populateNodeModal,
        nodeClick,
        edgeClick,
        populateEdgeModal,
        uploadModel,
        addDefaultBehaviorToAjax,
        checkCsrfSafe,
        getCookie,
        openModel;

    //  **********Query Selectors************
    let $modelOptions,
        $modalNode,
        $uploadContainer,
        $modalNodeLabel,
        $modalEdge,
        $modalEdgeLabel,
        $btnOpenModel,
        $chkGraphEdit,
        $modalLog,
        $loadFromLocal,
        $fileDisplayArea,
        $chkOptionsEdit,
        $btnOptionsOk,
        $chkNodeEdit,
        $chkEdgeEdit,
        $btnNodeOk,
        $btnNodeCancel,
        $btnEdgeOk,
        $btnEdgeCancel,
        $inpUlTitle,
        $inpUlDescription,
        $inpUlKeywords,
        $btnUl,
        $btnUlCancel,
        $viewTabs,
        $loadingModel,
        $nodeEdgeSelect;

    //  *******Node/Edge Element Html********
    let nodeHtml = {
        Junction:
        "<tr><td><b>Junction:</b></td><td><input type='text' id='node-id' class='inp-properties' readonly></td></tr>" +
        "<tr><td>Elev:</td><td><input type='number' class='inp-properties' readonly></td></tr>" +
        "<tr><td>Demand:</td><td><input type='number' class='inp-properties' readonly></td></tr>" +
        "<tr><td>Pattern:</td><td><input type='text' class='inp-properties' readonly></td></tr>" +
        "<tr><td>Quality:</td><td><input type='number' class='inp-properties' readonly></td></tr>",
        Reservoir:
        "<tr><td><b>Reservoir:</b></td><td><input type='text' id='node-id' class='inp-properties' readonly></td></tr>" +
        "<tr><td>Head:</td><td><input type='text' class='inp-properties' readonly></td></tr>" +
        "<tr><td>Pattern:</td><td><input type='text' class='inp-properties' readonly></td></tr>" +
        "<tr><td>Quality:</td><td><input type='number' class='inp-properties' readonly></td></tr>",
        Tank: "<tr><td><b>Tank:</b></td><td><input type='text' id='node-id' class='inp-properties' readonly></td></tr>" +
        "<tr><td>Elevation:</td><td><input type='number' class='inp-properties' readonly></td></tr>" +
        "<tr><td>InitLevel:</td><td><input type='number' class='inp-properties' readonly></td></tr>" +
        "<tr><td>MinLevel:</td><td><input type='number' class='inp-properties' readonly></td></tr>" +
        "<tr><td>MaxLevel:</td><td><input type='number' class='inp-properties' readonly></td></tr>" +
        "<tr><td>Diameter:</td><td><input type='number' class='inp-properties' readonly></td></tr>" +
        "<tr><td>MinVol:</td><td><input type='number' class='inp-properties' readonly></td></tr>" +
        "<tr><td>VolCurve:</td><td><input type='text' class='inp-properties' readonly></td></tr>" +
        "<tr><td>Quality:</td><td><input type='number' class='inp-properties' readonly></td></tr>",
        Vertex:
            "<tr><td><b>Vertex:</b></td><td><input type='text' id='node-id' readonly></td></tr>"
    };

    let edgeHtml = {
        Pipe:
        "<tr><td><b>Pipe:</b></td><td><input type='text' id='edge-id' class='inp-properties' readonly></td></tr>" +
        "<tr><td>Length:</td><td><input type='number' class='inp-properties' readonly></td></tr>" +
        "<tr><td>Roughness:</td><td><input type='number' class='inp-properties' readonly></td></tr>" +
        "<tr><td>Diameter:</td><td><input type='number' class='inp-properties' readonly></td></tr>" +
        "<tr><td>Minor Loss:</td><td><input type='number' class='inp-properties'readonly></td></tr>" +
        "<tr><td>Status:</td><td><input type='text' class='inp-properties'readonly><br><p>('Open', 'Closed', or 'CV')</p></td></tr>",
        Pump:
        "<tr><td><b>Pump:</td><td><input type='text' id='edge-id' class='inp-properties'readonly></td></tr>" +
        "<tr><td>Parameters:</td><td><input type='text' class='inp-properties'readonly><br>" +
        "<input type='text' class='inp-properties'readonly></td></tr>",
        Valve:
        "<div><b>Valve:</td><td><input type='text' id='edge-id' class='inp-properties'readonly></td></tr>" +
        "<tr><td>Diameter:</td><td><input type='number' class='inp-properties'readonly></td></tr>" +
        "<tr><td>Type:</td><td><input type='text' class='inp-properties' readonly></td></tr>" +
        "<tr><td>Setting:</td><td><input type='number' class='inp-properties' readonly></td></tr>" +
        "<tr><td>Minor Loss:</td><td><input type='number' class='inp-properties' readonly></td></tr>"
    };

    /******************************************************
     **************FUNCTION DECLARATIONS*******************
     ******************************************************/

    addInitialEventListeners = function () {
        $('#btn-model-rep').click(function () {
            let curURL = window.location.href;
            window.open(curURL.substring(0, curURL.indexOf('/apps/') + 6) + "epanet-model-repository/", "modelRepository");
        });

        $loadFromLocal.addEventListener('change', function() {
            let file = $loadFromLocal.files[0];

            let reader = new FileReader();

            reader.onload = function() {
                $fileDisplayArea.innerText = reader.result;
            };

            reader.readAsText(file);
        });

        $btnUl.click(function() {
            if ($inpUlTitle.val() !== '' && $inpUlDescription.val() !== '' && $inpUlKeywords.val() !== '') {
                model.title = [$inpUlTitle.val(), $inpUlDescription.val()];

                let epanetWriter = new EPANET_Writer(model);

                // let data = new FormData();
                // data.append('model_title', $inpUlTitle.val());
                // data.append('model_description', $inpUlDescription.val());
                // data.append('model_keywords', $inpUlKeywords.tagsinput('items'));
                // data.append('model_file', epanetWriter.getFile());
                //
                // uploadModel(data);

                $('#modal-upload').modal('hide');
                resetUploadState();
            }
            else {
                alert("Fields not entered correctly. Cannot upload model to Hydroshare. Fill the correct fields in and try again.");
            }
        });

        $btnUlCancel.click(function() {
            resetUploadState();
        });

        $chkGraphEdit.click(function() {
            if ($chkGraphEdit.is(':checked')) {
                let dragListener = sigma.plugins.dragNodes(s, s.renderers[0]);

                dragListener.bind('startdrag', function(e) {
                    $('#model-display').css("cursor", "-webkit-grabbing");
                });
                dragListener.bind('drag', function(e) {
                    s.unbind('clickNodes');
                });
                dragListener.bind('dragend', function(e) {
                    $('#model-display').css("cursor", "-webkit-grab");

                    setTimeout(function(){
                        s.bind('clickNodes', function(e) {
                            nodeClick(e);
                        });
                    },250);

                    let myNode = model.nodes.find(node => node.id === e.data.node.id);
                    myNode.x = Math.round(e.data.node.x * 100) / 100;
                    myNode.y = Math.round(e.data.node.y * 100) / 100;
                });

                $('#model-display').css("cursor", "-webkit-grab");
            }
            else {
                sigma.plugins.killDragNodes(s);

                $('#model-display').css("cursor", "default");
            }
        });

        $modalNode.on('hidden.bs.modal', function () {
            curNode.color = graphColors[curNode.epaType];
            s.refresh();
        });

        $modalEdge.on('hidden.bs.modal', function () {
            curEdge.hover_color = graphColors[curEdge.epaType];
            s.refresh();
        });

        $chkOptionsEdit.click(function () {
            if ($chkOptionsEdit.is(':checked')) {
                $btnOptionsOk.removeAttr('disabled');

                $modelOptions.find('input').attr('readonly', false);
                $modelOptions.find('select').attr('disabled', false);
            }
            else {
                $btnOptionsOk.attr('disabled', true);

                $modelOptions.find('input').attr('readonly', true);
                $modelOptions.find('select').attr('disabled', true);

                populateModelOptions();
            }
        });

        $btnOptionsOk.click(function() {
            for(let key in model.options) {
                if(key === "unbalanced" || key === "quality" || key === "hydraulics") {
                    model.options[key][0] = $('#' + key + 1).val();
                    model.options[key][1] = $('#' + key + 2).val();
                }
                else
                    model.options[key] = $('#' + key).val();
            }

            $modelOptions.find('input').attr('readonly', true);
            $modelOptions.find('select').attr('disabled', true);
            resetModelState();
            populateModelOptions();
        });

        $chkNodeEdit.click(function() {
            if ($chkNodeEdit.is(':checked')) {
                $btnNodeOk.removeAttr('disabled');

                $modalNode.find('input').attr('readonly', false);
            }
            else {
                $btnNodeOk.attr('disabled', true);

                $modalNode.find('input').attr('readonly', true);

                populateNodeModal(curNode);
            }
        });

        $chkEdgeEdit.click(function() {
            if ($chkEdgeEdit.is(':checked')) {
                $btnEdgeOk.removeAttr('disabled');

                $modalEdge.find('input').attr('readonly', false);
            }
            else {
                $btnEdgeOk.attr('disabled', true);

                $modalEdge.find('input').attr('readonly', true);

                populateEdgeModal(curEdge);
            }
        });

        $btnNodeOk.click(function() {
            $modalNode.modal('hide');

            let edges = model.edges;
            for (let i in edges) {
                if (edges[i].type === "vert") {
                    for (let j in edges[i].vert) {
                        if (edges[i].vert[j] === curNode.id) {
                            edges[i].vert[j] = $('#node-id').val();
                        }
                    }
                }
            }

            curNode.id = $('#node-id').val();
            curNode.label = curNode.epaType + ' ' + $('#node-id').val();

            for (let i = 1; i < $modalNode.find('input').length; ++i) {
                curNode.values[i - 1] = $modalNode.find('input')[i].value;
            }

            resetModelState();
        });

        $btnNodeCancel.click(function() {
            resetModelState();
        });

        $btnEdgeOk.click(function() {
            $modalEdge.modal('hide');

            curEdge.id = $('#edge-id').val();
            curEdge.label = curEdge.epaType + ' ' + $('#edge-id').val();

            for (let i = 1; i < $modalEdge.find('input').length; ++i) {
                curEdge.values[i - 1] = $modalEdge.find('input')[i].value;
            }

            resetModelState();
        });

        $btnEdgeCancel.click(function() {
            resetModelState();
        });

        $('#file-display-area').bind("DOMSubtreeModified",function(){
            $('#view-tabs').removeClass('hidden');
            $('#loading-model').addClass('hidden');
            $uploadContainer.removeClass('hidden');

            $viewTabs.tabs({ active: 0 });

            model = {
                nodes: [],
                edges: [],
                options: {}
            };

            $("#model-container").remove();
            $("#model-display").append("<div id='model-container'></div>");

            file_text = $fileDisplayArea.innerText;

            let epanetReader = new EPANET_Reader(file_text, "not");

            model = epanetReader.getModel();
            populateModelOptions();

            s = new sigma({
                graph: model,
                renderer: {
                    container: $("#model-container")[0],
                    type: 'canvas'
                },
                settings: {
                    minNodeSize: 0.3,
                    maxNodeSize: 6.5,
                    minEdgeSize: 0.5,
                    maxEdgeSize: 4,
                    enableEdgeHovering: true,
                    edgeHoverSizeRatio: 1.5,
                    nodesPowRatio: 0.3,
                    edgesPowRatio: 0.2,
                    immutable: false
                }
            });

            s.cameras[0].goTo({ ratio: 1.2 });

            s.bind('clickNodes', function(e) {
                nodeClick(e);
            });

            s.bind('clickEdges', function(e) {
                edgeClick(e);
            });

            s.refresh();
        });
    };

    nodeClick = function (e) {
        if(!e.data.captor.isDragging) {
            $('#node-dialog').css({top: e.data.captor.clientY - 10, left: e.data.captor.clientX * 2 - 1600});

            let curNodes = e.data.node;
            if (curNodes.length > 1) {
                $nodeEdgeSelect.empty();
                $nodeEdgeSelect.append('<p>Select a Node to display</p>');

                let selectHtml = "<select id='select-node-edge'>";
                for (let i in curNodes) {
                    selectHtml += "<option value='" + i + "'>" + curNodes[i].epaType + " " + curNodes[i].id + "</option>";
                }
                selectHtml += "</select";
                $nodeEdgeSelect.append(selectHtml);
                $nodeEdgeSelect.dialog({
                    title: "Node Select",
                    dialogClass: "no-close",
                    resizable: false,
                    height: "auto",
                    width: 400,
                    modal: true,
                    buttons: {
                        Ok: function () {
                            curNode = curNodes[$('#select-node-edge').val()];
                            populateNodeModal();
                            $(this).dialog("close");
                        },
                        Cancel: function () {
                            $(this).dialog("close");
                        }
                    }
                });

                $nodeEdgeSelect.dialog("open");
            }
            else {
                curNode = curNodes[0];
                populateNodeModal();
            }
            s.refresh();
        }
    };

    edgeClick = function(e) {
        if(!e.data.captor.isDragging) {
            $('#edge-dialog').css({top: e.data.captor.clientY - 10, left: e.data.captor.clientX * 2 - 1600});

            let curEdges = e.data.edge;
            if (curEdges.length > 1) {
                $nodeEdgeSelect.empty();
                $nodeEdgeSelect.append('<p>Select an Edge to display</p>');

                let selectHtml = "<select id='select-node-edge'>";
                for (let i in curEdges) {
                    selectHtml += "<option value='" + i + "'>" + curEdges[i].epaType + " " + curEdges[i].id + "</option>";
                }
                selectHtml += "</select";
                $nodeEdgeSelect.append(selectHtml);

                $nodeEdgeSelect.dialog({
                    title: "Edge Select",
                    dialogClass: "no-close",
                    resizable: false,
                    height: "auto",
                    width: 400,
                    modal: true,
                    buttons: {
                        Ok: function () {
                            curEdge = curEdges[$('#select-node-edge').val()];
                            populateEdgeModal();
                            $(this).dialog("close");
                        },
                        Cancel: function () {
                            $(this).dialog("close");
                        }
                    }
                });

                $nodeEdgeSelect.dialog("open");
            }
            else {
                curEdge = curEdges[0];
                populateEdgeModal();
            }
            s.refresh();
        }
    };

    populateModelOptions = function () {
        for(let key in model.options) {
            if(key === "unbalanced" || key === "quality" || key === "hydraulics") {
                $('#' + key + 1).val(model.options[key][0]);
                $('#' + key + 2).val(model.options[key][1]);
            }
            else
                $('#' + key).val(model.options[key])
        }
    };

    populateNodeModal = function () {
        curNode.color = "#1affff";
        s.refresh();

        let values = curNode.values;

        let html = "<table class='table table-nonfluid'><tbody>" + nodeHtml[curNode.epaType] + "</tbody></table>";

        $modalNodeLabel.html(curNode.epaType + " Properties");
        $modalNode.find('.modal-body').html(html);
        $modalNode.modal('show');

        $('#node-id').val(curNode.id);

        for (let i = 0; i < values.length - 1; ++i) {
            $modalNode.find('input')[i + 1].value = curNode.values[i];
        }
    };

    populateEdgeModal = function () {
        curEdge.hover_color = "#1affff";
        s.refresh();

        let values = curEdge.values;

        let html = "<table class='table table-nonfluid'><tbody>" + edgeHtml[curEdge.epaType] + "</tbody></table>";

        $modalEdgeLabel.html(curEdge.epaType + " Properties");
        $modalEdge.find('.modal-body').html(html);
        $modalEdge.modal('show');

        $('#edge-id').val(curEdge.id);

        for (let i = 0; i < values.length - 1; ++i) {
            $modalEdge.find('input')[i + 1].value = curEdge.values[i];
        }
    };

    resetModelState = function() {
        s.refresh();
        $btnOptionsOk.attr('disabled', true);
        $chkOptionsEdit.attr('checked', false);
        $btnNodeOk.attr('disabled', true);
        $btnEdgeOk.attr('disabled', true);
        $chkNodeEdit.attr('checked', false);
        $chkEdgeEdit.attr('checked', false);
    };

    resetUploadState = function() {
        $inpUlTitle.val('');
        $inpUlDescription.val('');
        $inpUlKeywords.tagsinput('removeAll');
    };

    openInitialModel = function () {
        let $initialModel = $('#initial-model');
        if ($initialModel.length) {
            openModel($initialModel.html());
        }
    };

    initializeJqueryVariables = function () {
        $btnOpenModel = $('#btn-open-model');
        $modelOptions = $('#model-options-view');
        $uploadContainer = $('#upload-container');
        $modalNode = $('#modal-node');
        $modalNodeLabel = $('#modal-node-label');
        $modalEdge = $('#modal-edge');
        $modalEdgeLabel = $('#modal-edge-label');
        $modalLog = $('#modalLog');
        $chkGraphEdit = $('#chk-graph');
        $loadFromLocal = $("#load-from-local")[0];
        $fileDisplayArea = $("#file-display-area")[0];
        $btnOptionsOk = $('#btn-options-ok');
        $chkOptionsEdit = $('#chk-options');
        $chkNodeEdit = $('#chk-node');
        $chkEdgeEdit = $('#chk-edge');
        $btnNodeOk = $('#btn-node-ok');
        $btnNodeCancel = $('#btn-node-cancel');
        $btnEdgeOk = $('#btn-edge-ok');
        $btnEdgeCancel = $('#btn-edge-cancel');
        $inpUlTitle = $('#inp-upload-title');
        $inpUlDescription = $('#inp-upload-description');
        $inpUlKeywords = $('#tagsinp-upload-keywords');
        $btnUl = $('#btn-upload');
        $btnUlCancel = $('#btn-upload-cancel');
        $viewTabs = $('#view-tabs');
        $loadingModel = $('#loading-model');
        $nodeEdgeSelect = $('#node-edge-select');
    };

    openModel = function (modelId) {
        let data = {'model_id': modelId};

        $('#view-tabs').addClass('hidden');
        $('#loading-model').removeClass('hidden');

        $.ajax({
            type: 'GET',
            url: '/apps/epanet-model-viewer/get-epanet-model',
            dataType: 'json',
            data: data,
            error: function () {
                let message = 'An unexpected error ocurred while processing the following model ' +
                    '<a href="https://www.hydroshare.org/resource/' + modelId + '" target="_blank">' +
                    modelId + '</a>. An app admin has been notified.';

                addLogEntry('danger', message);
            },
            success: function (response) {
                let message;

                if (response.hasOwnProperty('success')) {
                    if (response.hasOwnProperty('message')) {
                        message = response.message;
                    }

                    if (!response.success) {
                        if (!message) {
                            message = 'An unexpected error ocurred while processing the following model ' +
                                '<a href="https://www.hydroshare.org/resource/' + modelId + '" target="_blank">' +
                                modelId + '</a>. An app admin has been notified.';
                        }

                        addLogEntry('danger', message);
                    } else {
                        if (message) {
                            addLogEntry('warning', message);
                        }
                        if (response.hasOwnProperty('results')) {
                            addModelToUI(response.results);
                            addMetadataToUI(response.metadata);
                        }
                    }
                }
            }
        });
    };

    uploadModel = function (data) {
        $.ajax({
            type: 'POST',
            url: '/apps/epanet-model-viewer/upload-epanet-model/',
            dataType: 'json',
            processData: false,
            contentType: false,
            data: data,
            error: function () {
                let message = 'An unexpected error occurred while uploading the model ';

                addLogEntry('danger', message);
            },
            success: function (response) {
                let message;

                if (response.hasOwnProperty('success')) {
                    if (response.hasOwnProperty('message')) {
                        message = response.message;
                    }

                    if (!response.success) {
                        if (!message) {
                            message = 'An unexpected error occurred while uploading the model';
                        }

                        addLogEntry('danger', message);
                    } else {
                        if (message) {
                            addLogEntry('warning', message);
                        }
                        if (response.hasOwnProperty('results') && response.hasOwnProperty('metadata')) {
                            addModelToUI(response.results);
                            addMetadataToUI(response.metadata);
                            $modalModelRep.find('.modal-body').html('<img src="/static/epanet_model_viewer/images/loading-animation.gif">' +
                                '<br><p><b>Loading model repository...</b></p><p>Note: Loading will continue if dialog is closed.</p>');
                            alert("Model has successfully been uploaded to HydroShare.");
                            generateModelList();
                        }
                        else {
                            $uploadContainer.addClass('hidden');
                            $modalModelRep.find('.modal-body').html('<img src="/static/epanet_model_viewer/images/loading-animation.gif">' +
                                '<br><p><b>Loading model repository...</b></p><p>Note: Loading will continue if dialog is closed.</p>');
                            alert("Model has successfully been uploaded to HydroShare.");
                            generateModelList();
                        }
                    }
                }
            }
        });
    };

    setStateAfterLastModel = function () {
        hideMainLoadAnim();
        if (showLog) {
            $modalLog.modal('show');
            showLog = false;
        } else {
            showLoadingCompleteStatus(true, 'Resource(s) added successfully!');
        }
    };

    hideMainLoadAnim = function () {
        $('#div-loading').addClass('hidden');
    };

    showLoadingCompleteStatus = function (success, message) {
        let successClass = success ? 'success' : 'error';
        let $modelLoadingStatus = $('#model-load-status');
        let $statusText = $('#status-text');
        let showTime = success ? 2000 : 4000;
        $statusText.text(message)
            .removeClass('success error')
            .addClass(successClass);
        $modelLoadingStatus.removeClass('hidden');
        setTimeout(function () {
            $modelLoadingStatus.addClass('hidden');
        }, showTime);
    };

    addModelToUI = function (result) {
        $fileDisplayArea.innerText = result;

        setStateAfterLastModel();
    };

    addMetadataToUI = function (metadata) {
        let metadataDisplayArea = $('#metadata-display-area')[0];
        let metadataHTML = '<p><h1>' + metadata['title'] + '</h1><h6>' + metadata['description'] + '</h6>' +
            '<a href="' + metadata['identifiers'][0]['url'] + '" style="color:#3366ff">View the Model in HydroShare</a><br><br>' +
            'Created: ' + metadata['dates'][1]['start_date'].substring(0, 10) +
            ', &emsp;Last Modified: ' + metadata['dates'][1]['start_date'].substring(0, 10) +
            '<br>Author: ' + metadata['creators'][0]['name'] + '<br>Rights: ' + metadata['rights'];

        let subjects = "";
        let i;
        for (i in metadata['subjects']) {
            subjects += metadata['subjects'][i]['value'] + ', ';
        }
        metadataHTML += '<br>Subjects: ' + subjects.substring(0, subjects.length - 2);


        try {
            metadataHTML += '<br> Program: ' + '<a href="' + metadata['executed_by']['modelProgramIdentifier'] +
                '" style="color:#3366ff">' + metadata['executed_by']['modelProgramName'] + '</a>';
        }
        catch (error) {
            //    No program included in metadata
        }


        metadataHTML += '</p><br>';

        metadataHTML += '<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title"><a data-toggle="collapse" href="#metadata-json">&nbsp; Raw Metadata JSON<span class="glyphicon glyphicon-minus pull-left"></span></a></h4></div><div id="metadata-json" class="filter-list panel-collapse collapse"><pre>' + JSON.stringify(metadata, null, 2) + '</pre></div></div>';

        metadataDisplayArea.innerHTML = metadataHTML;
    };

    addLogEntry = function (type, message, show) {
        let icon;
        let timeStamp;

        switch (type) {
            case 'success':
                icon = 'ok';
                break;
            case 'danger':
                icon = 'remove';
                showLog = true;
                break;
            default:
                icon = type;
                showLog = true;
        }

        timeStamp = new Date().toISOString();

        $('#logEntries').prepend('<div class="alert-' + type + '">' +
            '<span class="glyphicon glyphicon-' + icon + '-sign" aria-hidden="true"></span>  '
            + timeStamp + ' *** \t'
            + message +
            '</div><br>');

        if (show) {
            $modalLog.modal('show');
            showLog = false;
        }
    };

    /*-----------------------------------------------
     ************TO ENABLE PROPER UPLOAD*************
     ----------------------------------------------*/
    addDefaultBehaviorToAjax = function () {
        $.ajaxSetup({
            beforeSend: function (xhr, settings) {
                if (!checkCsrfSafe(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
                }
            }
        });
    };

    checkCsrfSafe = function (method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    };

    getCookie = function (name) {
        let cookie;
        let cookies;
        let cookieValue = null;
        let i;

        if (document.cookie && document.cookie !== '') {
            cookies = document.cookie.split(';');
            for (i = 0; i < cookies.length; i += 1) {
                cookie = $.trim(cookies[i]);
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };


    /*-----------------------------------------------
     **************ONLOAD FUNCTION*******************
     ----------------------------------------------*/
    $(function () {
        $("#app-content-wrapper").removeClass('show-nav');
        $('[data-toggle="tooltip"]').tooltip();

        openInitialModel();
        initializeJqueryVariables();
        addInitialEventListeners();
        addDefaultBehaviorToAjax();

        $viewTabs.tabs({ active: 0 });
        $nodeEdgeSelect.dialog({ autoOpen: false });

        // Custom edge render for edges with vertices
        sigma.utils.pkg('sigma.canvas.edges');
        sigma.canvas.edges.vert = function(edge, source, target, context, settings) {
            let color = edge.color,
                prefix = settings('prefix') || '';

            context.strokeStyle = color;
            context.lineWidth = edge[prefix + 'size'];

            context.beginPath();
            context.moveTo(
                source[prefix + 'x'],
                source[prefix + 'y']
            );

            let verticies = edge.vert;

            for (let i = 0; i < verticies.length; ++i) {
                try {
                    let nodesOnScreen = s.renderers["0"].nodesOnScreen;
                    let nextVert = nodesOnScreen.find(node => node.id === verticies[i]);

                    context.lineTo(
                        nextVert[prefix + 'x'],
                        nextVert[prefix + 'y']
                    );
                }
                catch (e) {
                    // nothing
                }
            }

            context.lineTo(
                target[prefix + 'x'],
                target[prefix + 'y']
            );

            context.stroke();
        };

        sigma.utils.pkg('sigma.canvas.edgehovers');
        sigma.canvas.edgehovers.vert = function(edge, source, target, context, settings) {
            var color = edge.color,
                prefix = settings('prefix') || '',
                size = settings('edgeHoverSizeRatio') * (edge[prefix + 'size'] || 1),
                edgeColor = settings('edgeColor'),
                defaultNodeColor = settings('defaultNodeColor'),
                defaultEdgeColor = settings('defaultEdgeColor'),
                sX = source[prefix + 'x'],
                sY = source[prefix + 'y'],
                tX = target[prefix + 'x'],
                tY = target[prefix + 'y'];

            if (!color)
                switch (edgeColor) {
                    case 'source':
                        color = source.color || defaultNodeColor;
                        break;
                    case 'target':
                        color = target.color || defaultNodeColor;
                        break;
                    default:
                        color = defaultEdgeColor;
                        break;
                }

            if (settings('edgeHoverColor') === 'edge') {
                color = edge.hover_color || color;
            } else {
                color = edge.hover_color || settings('defaultEdgeHoverColor') || color;
            }

            context.strokeStyle = color;
            context.lineWidth = size;
            context.beginPath();
            context.moveTo(sX, sY);
            let verticies = edge.vert;
            for (let i = 0; i < verticies.length; ++i) {
                try {
                    let nodesOnScreen = s.renderers["0"].nodesOnScreen;
                    let nextVert = nodesOnScreen.find(node => node.id === verticies[i]);

                    context.lineTo(
                        nextVert[prefix + 'x'],
                        nextVert[prefix + 'y']
                    );
                }
                catch (e) {
                    // nothing
                }
            }
            context.lineTo(tX, tY);
            context.stroke();
        };
    });

    /*-----------------------------------------------
     ***************INVOKE IMMEDIATELY***************
     ----------------------------------------------*/

    sigma.utils.pkg('sigma.canvas.nodes');

    showLog = false;
}()); // End of package wrapper
// NOTE: that the call operator (open-closed parenthesis) is used to invoke the library wrapper
// function immediately after being parsed.