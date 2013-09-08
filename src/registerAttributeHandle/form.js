/*
 *form-bind只做绑定form处理事件，value绑定需要另外通过attr-value={(XX)}来绑定，避免重复
 */
var _formCache = [],
	_formKey = {
		"input": function(node) {
			var result = "value";
			// switch (node.type.toLowerCase()) {
			// 	case "button":
			// 	case "reset":
			// 	case "submit":
			// }
			return {
				attributeName: "value",
				eventNames: ["keyup", "change"]
			};
		},
		"button": "innerHTML"
	}, _noopFormHandle = function(e, newValue) {
		return newValue
	},
	formListerAttribute = function(key, currentNode, parserNode, vi, dm, handle, triggerTable) {
		var attrOuter = _getAttrOuter(parserNode),
			eventConfig = _formKey[currentNode.tagName.toLowerCase()] || {
				attributeName: "innerHTML",
				eventNames: ["click"]
			},
			eventNames,
			index = $.iO(_formCache, currentNode),
			formCollection,
			oldFormHandle,
			newFormHandle,
			obj = dm.get(attrOuter, $NULL);
		typeof eventConfig === "function" && (eventConfig = eventConfig(currentNode));
		eventNames = eventConfig.eventNames;

		if (index === -1) {
			index = $.p(_formCache, currentNode)
			_formCache.event[index] = {};
		};
		formCollection = _formCache.event[index];
		$.ftE(eventNames, function(eventName) {
			if (oldFormHandle = formCollection[eventName]) {
				_cancelEvent(currentNode, eventName, oldFormHandle)
			}
			if (obj instanceof Proto) {
				var baseFormHandle = obj.form === $NULL ? _noopFormHandle : obj.form;
				newFormHandle = function(e) {
					dm.set(attrOuter, baseFormHandle(e, this[eventConfig.attributeName]))
				};
				_registerEvent(currentNode, eventName, newFormHandle);
			} else if (typeof obj === "string") {
				newFormHandle = function(e) {
					dm.set(attrOuter, this[eventConfig.attributeName])
				};
				_registerEvent(currentNode, eventName, newFormHandle);
			}
			formCollection[eventName] = newFormHandle;
		});
	};
_formCache.event = {};
V.ra("bind-form", function(attrKey) {
	return formListerAttribute;
})