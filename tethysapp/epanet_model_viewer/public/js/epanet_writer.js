const opts = {units:'Units\t\t', headloss:'Headloss\t', specific:'Specific Gravity', viscosity:'Viscosity\t', trials:'Trials\t\t',
    accuracy:'Accuracy\t', checkfreq:'CHECKFREQ\t', maxcheck:'MAXCHECK\t', damplimit:'DAMPLIMIT\t', unbalanced:'Unbalanced\t',
    pattern:'Pattern\t', demand:'Demand Multiplier', emitter:'Emitter Exponent', quality:'Quality\t', diffusivity:'Diffusivity\t',
    tolerance:'Tolerance\t', map:'Map\t'};


function EPANET_Writer(curModel) {
    var file_text = "";

    var titleText = "[TITLE]\n";
    var junctText = "[JUNCTIONS]\n;ID\t\t\tElev\t\tDemand\t\tPattern\n";
    var resText = "[RESERVOIRS]\n;ID\t\t\tHead\t\tPattern\n";
    var tankText = "[TANKS]\n;ID\t\t\tElevation\tInitLevel\tMinLevel\tMaxLevel\tDiameter\tMinVol\t\tVolCurve\n";
    var pipeText = "[PIPES]\n;ID\t\t\tNode1\t\t\tNode2\t\t\tLength\t\tDiameter\tRoughness\tMinorLoss\tStatus\n";
    var pumpText = "[PUMPS]\n;ID\t\t\tNode1\t\t\tNode2\t\t\tParameters\n";
    var valvText = "[VALVES]\n;ID\t\t\tNode1\t\t\tNode2\t\t\tDiameter\tType\tSetting\t\tMinorLoss\n";
    var tagText = "[TAGS]\n";
    var demandText = "[DEMANDS]\n;Junction\tDemand\tPattern\tCategory\n";
    var statusText = "[STATUS]\n;ID\tStatus/Setting\n";
    var patternText = "[PATTERNS]\n;ID\tMultipliers;\nEdited Curve\n";
    var curvText = "[CURVES]\n;ID\tX-Value\tY-Value\n";
    var controlText = "[CONTROLS]\n";
    var ruleText = "[RULES]\n";
    var energyText = "[ENERGY]\n";
    var emmitText = "[EMITTERS]\n;Junction\tCoefficient\n";
    var qualText = "[QUALITY]\n;Node\t\t\tInitQual\n";
    var sourceText = "[SOURCES]\n;Node\tType\tQuality\tPattern\t\n";
    var react1Text = "[REACTIONS]\n;Type\tPipe/Tank\tCoefficient\n";
    var react2Text = "[REACTIONS]\n";
    var mixText = "[MIXING]\n;Tank\tModel\n";
    var timeText = "[TIMES]\n";
    var reportText = "[REPORT]\n";
    var optText = "[OPTIONS]\n";
    var coordText = "[COORDINATES]\n;Node\t\t\tX-Coord\t\t\tY-Coord\n";
    var vertText = "[VERTICES]\n;Link\t\t\tX-Coord\t\t\tY-Coord\n";
    var labelText = "[LABELS]\n;X-Coord\tY-Coord\tLabel & Anchor Node\n";
    var backText = "[BACKDROP]\n";
    var endText = "[END]";

    var nodes = curModel.nodes;
    var edges = curModel.edges;
    var options = curModel.options;

    titleText += curModel.title.join('\n') + '\n\n';

    nodes.forEach(function (node) {
        if (node.type == "Junction") {
            junctText += ' ' + node.id + '\t\t\t' + node.values.slice(0, 3).join('\t\t') + '\t\t\t;\n';
            popNodeQC(node, node.values.length > 3);
        }
        else if (node.type == "Reservoir") {
            resText += ' ' + node.id + '\t\t\t' + node.values.slice(0, 2).join('\t\t') + '\t\t\t;\n';
            popNodeQC(node, node.values.length > 2);
        }
        else if (node.type == "Tank") {
            tankText += ' ' + node.id + '\t\t\t' + node.values.slice(0, 7).join('\t\t') + '\t\t\t;\n';
            popNodeQC(node, node.values.length > 7);
        }
        else {
            vertText += ' ' + node.id.substring(0, 2) + '\t\t\t' + node.x + '\t\t' + -1 * node.y + '\n';
        }
    });

    junctText += '\n';
    resText += '\n';
    tankText += '\n';
    vertText += '\n';
    qualText += '\n';
    coordText += '\n';

    edges.forEach(function (edge) {
        if (edge.type == "Pipe") {
           pipeText += ' ' + edge.id + '\t\t\t' + edge.source + '\t\t\t' + edge.target + '\t\t\t' + edge.values.join('\t\t') + '\t;\n';
        }
        else if (edge.type == "Pump") {
            pumpText += ' ' + edge.id + '\t\t\t' + edge.source + '\t\t\t' + edge.target + '\t\t\t' + edge.values.join(' ') + '\t;\n';
        }
        else {
            valvText += ' ' + edge.id + '\t\t\t' + edge.source + '\t\t\t' + edge.target + '\t\t\t' + edge.values[0] + '\t\t' +
                edge.values[1] + '\t' + edge.values[2] + '\t\t' + edge.values[3] + '\t\t;\n';
        }
    });

    pipeText += '\n';
    pumpText += '\n';
    valvText += '\n';

    for(var key in options) {
            if(key == "unbalanced" || key == "quality" || key == "hydraulics") {
                optText += ' ' + opts[key] + '\t' + options[key][0] + ' ' + options[key][1] + '\n'
            }
            else
                optText += ' ' + opts[key] + '\t' + options[key] + '\n'
        }

    optText += '\n';

    tagText += '\n';
    demandText += '\n';
    statusText += '\n';
    patternText += '\n';
    curvText += '\n';
    controlText += '\n';
    ruleText += '\n';
    energyText += '\n';
    emmitText += '\n';
    sourceText += '\n';
    react1Text += '\n';
    react2Text += '\n';
    mixText += '\n';
    timeText += '\n';
    reportText += '\n';
    labelText += '\n';
    backText += '\n';
    endText += '\n';

    file_text += titleText + junctText + resText + tankText + pipeText + pumpText + valvText + tagText + demandText + statusText +
        patternText + curvText + controlText + ruleText + energyText + emmitText + qualText + sourceText + react1Text + react2Text +
        mixText + timeText + reportText + optText + coordText + vertText + labelText + backText + endText;

    console.log(file_text);

    this.getFile = function() {
        return file_text;
    };

    function popNodeQC(node, hasQuality) {
        if (hasQuality)
            qualText += ' ' + node.id + '\t\t\t' + node.values[node.values.length - 1] + '\n';

        coordText += ' ' + node.id + '\t\t\t' + node.x + '\t\t' + -1 * node.y + '\n';
    }
}
