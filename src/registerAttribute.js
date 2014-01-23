//by RubyLouvre(司徒正美)
//setAttribute bug:http://www.iefans.net/ie-setattribute-bug/
var IEfix = {
    acceptcharset: "acceptCharset",
    accesskey: "accessKey",
    allowtransparency: "allowTransparency",
    bgcolor: "bgColor",
    cellpadding: "cellPadding",
    cellspacing: "cellSpacing",
    "class": "className",
    colspan: "colSpan",
    // checked: "defaultChecked",
    selected: "defaultSelected",
    "for": "htmlFor",
    frameborder: "frameBorder",
    hspace: "hSpace",
    longdesc: "longDesc",
    maxlength: "maxLength",
    marginwidth: "marginWidth",
    marginheight: "marginHeight",
    noresize: "noResize",
    noshade: "noShade",
    readonly: "readOnly",
    rowspan: "rowSpan",
    tabindex: "tabIndex",
    valign: "vAlign",
    vspace: "vSpace",
    DOMContentLoaded: "readystatechange"
},
    /*
The full list of boolean attributes in HTML 4.01 (and hence XHTML 1.0) is (with property names where they differ in case): 

checked             (input type=checkbox/radio) 
selected            (option) 
disabled            (input, textarea, button, select, option, optgroup) 
readonly            (input type=text/password, textarea) 
multiple            (select) 
ismap     isMap     (img, input type=image) 

defer               (script) 
declare             (object; never used) 
noresize  noResize  (frame) 
nowrap    noWrap    (td, th; deprecated) 
noshade   noShade   (hr; deprecated) 
compact             (ul, ol, dl, menu, dir; deprecated) 
//------------anyother answer 
all elements: hidden 
script: async, defer 
button: autofocus, formnovalidate, disabled 
input: autofocus, formnovalidate, multiple, readonly, required, disabled, checked 
keygen: autofocus, disabled 
select: autofocus, multiple, required, disabled 
textarea: autofocus, readonly, required, disabled 
style: scoped 
ol: reversed 
command: disabled, checked 
fieldset: disabled 
optgroup: disabled 
option: selected, disabled 
audio: autoplay, controls, loop, muted 
video: autoplay, controls, loop, muted 
iframe: seamless 
track: default 
img: ismap 
form: novalidate 
details: open 
object: typemustmatch 
marquee: truespeed 
//---- 
editable 
draggable 
*/
    _AttributeHandle = function(attrKey, element) {
        var assign;
        var attrHandles = V.attrHandles,
            result;
        $.e(attrHandles, function(attrHandle) {
            if (attrHandle.match(attrKey)) {
                // if (element.type==="textarea") {debugger}
                result = attrHandle.handle(attrKey, element);
                return $FALSE
            }
        });
        return result || _AttributeHandleEvent.com;
    },
    _templateMatchRule = /\{[\w\W]*?\{[\w\W]*?\}[\s]*\}/,
    attributeHandle = function(attrKey, attrValue, node, handle, triggerTable) {
        attrKey = attrKey.indexOf(V.prefix) ? attrKey : attrKey.replace(V.prefix, "")
        attrKey = (_isIE && IEfix[attrKey]) || attrKey
        // console.log(attrValue,":",_matchRule.test(attrValue)||_templateMatchRule.test(attrValue))
        //if (/*_matchRule.test(attrValue)||*/_templateMatchRule.test(attrValue)) {
        var attrViewModel = (V.attrModules[handle.id + attrKey] = jSouper.parse(attrValue, attrKey + "=" + attrValue))($UNDEFINED, {
            isAttr: $TRUE
        }),
            // _shadowDIV = fragment(), //$.D.cl(shadowDIV), //parserNode
            //获取对应的属性处理器
            _attributeHandle = _AttributeHandle(attrKey, node);
        // attrViewModel.append(_shadowDIV);
        attrViewModel._isAttr = {
            key: attrKey
        }
        var attrTrigger = {
            handleId: handle.id + attrKey,
            key: attrKey,
            type: "attributesTrigger",
            event: function(NodeList, model, /* eventTrigger,*/ isAttr, viewModel_ID) { /*NodeList, model, eventTrigger, self._isAttr, self._id*/
                var currentNode = NodeList[handle.id].currentNode,
                    viewModel = V._instances[viewModel_ID];
                if (currentNode) {
                    attrViewModel.model = model;
                    $.e(attrViewModel._triggers, function(key) { //touchoff all triggers
                        attrViewModel.touchOff(key);
                    });
                    _attributeHandle(attrKey, currentNode, /*_shadowDIV*/ attrViewModel.topNode(), viewModel, /*model.id,*/ handle, triggerTable);
                    // model.remove(attrViewModel); //?
                }
            }
        }
        $.e(attrViewModel._triggers, function(key) {
            $.us(triggerTable[key] || (triggerTable[key] = []), attrTrigger);
        });
        // node.removeAttribute(baseAttrKey);
        //}
    };
