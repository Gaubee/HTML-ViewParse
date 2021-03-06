V.rt("", function(handle, index, parentHandle) {
    var textHandle = handle.childNodes[0],
        textHandleId = textHandle.id,
        key = handle.handleInfo.expression, //textHandle.node.data,
        trigger = {
            key: ".", //const trigger
            bubble: $TRUE
        };

    var expression = Expression.get(key);
    //没有触发关键字的话则是当成纯字符串
    trigger.key = expression.keys.length ? expression.keys : "."

    trigger.event = function(NodeList_of_ViewModel, model, /* triggerBy,*/ isAttr /*, vi*/ ) { //call by ViewModel's Node
        var data = expression.foo(model)[0],
            nodeHandle = NodeList_of_ViewModel[textHandleId],
            currentNode = nodeHandle.currentNode;

        if (isAttr) {
            //字符串事件：IE浏览器直接编译，故不需要转义，其他浏览器需要以字符串绑定到属性中。需要转义，否则会出现引号冲突
            if (!_isIE && isAttr.key.indexOf("on") === 0 && currentNode.hasOwnProperty(isAttr.key)) {
                data = String(data).replace(/"/g, '\\"').replace(/'/g, "\\'");
            }
        }
        // data = String(data);
        if (nodeHandle._data !== String(data)) {
            nodeHandle._data = (data === $UNDEFINED ? "" : data);
            try{
                currentNode.data = nodeHandle._data;
            }catch(e){debugger/*IE 内存泄漏莫名其妙的问题*/}
        }
    }
    return trigger;
});
