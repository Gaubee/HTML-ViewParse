var newTemplateMatchReg = /\{\{([\w\W]+?)\}\}/g,
	// DoubleQuotedString = /"(?:\.|(\\\")|[^\""\n])*"/g, //双引号字符串
	// SingleQuotedString = /'(?:\.|(\\\')|[^\''\n])*'/g, //单引号字符串
	QuotedString = /"(?:\.|(\\\")|[^\""\n])*"|'(?:\.|(\\\')|[^\''\n])*'/g, //引号字符串
	ScriptNodeString = /<script[^>]*>([\s\S]*?)<\/script>/gi,
    XmpNodeString = /<xmp[^>]*>([\s\S]*?)<\/xmp>/gi,
	templateHandles = {};
$.fI(V.handles, function(handleFun, handleName) {
	var result = $TRUE
	if (handleName.charAt(0) === "/") {
		result = $FALSE //no arguments
	}
	templateHandles[handleName] = result
});
/*{
	"#if": $TRUE,
	"#else": $FALSE, //no arguments
	"/if": $FALSE,
	"@": $TRUE,
	"#each": $TRUE,
	"/each": $FALSE,
	"#with": $TRUE,
	"/with": $TRUE,
	"HTML": $TRUE,
	"#>": $TRUE,
	"#layout": $TRUE,
	"define": $TRUE
}*/
var templateOperatorNum = {
	"@": 1
	// , "!": 1
	// , "~": 1
	// , "++": 1
	// , "--": 1
	// , "+": 2
	// , "-": 2
	// , "*": 2
	// , "/": 2
	// , "&&": 2
	// , "||": 2
	// , "&": 2
	// , "|": 2
	// , "=": 2
	// , "==": 2
	// , "===": 2
	// , "!=": 2
	// , "!==": 2
	// , "%": 2
	// , "^": 2
	// , ">": 2
	// , "<": 2
	// , ">>": 2
	// , "<<": 2
}
$.E(_operator_list, function(operator) {
	templateOperatorNum[operator] = 2;
});
$.E(_unary_operator_list, function(operator) {
	templateOperatorNum[operator] = 1;
});
var parse = function(str) {
		var quotedString = [];
		var scriptNodeString = [];
		var Placeholder = "_" + Math.random(),
			ScriptPlaceholder = "_" + Math.random(),
			str = str.replace(QuotedString, function(qs) {
				quotedString.push(qs)
				return Placeholder;
			}).replace(ScriptNodeString,function (sns) {
				scriptNodeString.push(sns);
				return ScriptPlaceholder;
			}),
			result = str.replace(newTemplateMatchReg, function(matchStr, innerStr, index) {
				innerStr = innerStr.replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&") //Semantic confusion with HTML
				var fun_name = $.trim(innerStr).split(" ")[0];
				if (fun_name in templateHandles) {
					if (templateHandles[fun_name]) {
						var args = innerStr.replace(fun_name, "").split(","),
							result = "{" + fun_name + "(";
						$.E(args, function(arg) {
							if (arg = $.trim(arg)) {
								result += parseIte(parseArg(arg));
							}
						});
						result += ")}"
						return result;
					} else {
						return "{" + fun_name + "()}";
					}
				} else {
					return parseIte(parseArg($.trim(innerStr))); //"{(" + innerStr + ")}";
				}
			})

			result = result.replace(RegExp(ScriptPlaceholder, "g"),function(p) {
				return scriptNodeString.shift();
			}).replace(RegExp(Placeholder, "g"), function(p) {
				return quotedString.shift();
			}).replace(/\{\@\(\{\(([\w\W]+?)\)\}\)\}/g, function(matchStr, matchKey) {
				return "{@(" + matchKey + ")}";
			});
		return result
	},
	parseArg = function(argStr) {
		var allStack = [],
			inner = $TRUE;
		argStr.replace(/\(([\W\w]+?)\)/, function(matchSliceArgStr, sliceArgStr, index) {
			inner = $FALSE;
			var stack = parseStr(argStr.substr(0, index));
			allStack.push.apply(allStack, stack);
			$.p(allStack, {
				type: "arg",
				value: sliceArgStr,
				parse: parseIte(parseArg(sliceArgStr))
			})
			stack = parseStr(argStr.substring(index + matchSliceArgStr.length));
			allStack.push.apply(allStack, stack);
		});
		if (inner) {
			allStack.push.apply(allStack, parseStr(argStr));
		}
		return allStack;
	},
	parseStr = function(sliceArgStr) {
		var stack = [],
			pointer = 0;
		sliceArgStr.replace(/([^\w$\(\)]+)/g, function(matchOperator, operator, index, str) { //([\W]+)
			operator = $.trim(operator);
			if (operator && operator !== ".") {
				$.p(stack, {
					type: "arg",
					value: str.substring(pointer, index)
				});
				$.p(stack, {
					type: "ope",
					value: operator,
					num: templateOperatorNum[operator] || 0
				});
				pointer = index + matchOperator.length;
			}
			return matchOperator;
		});
		if (stack.length && !stack[0].value) {
			stack.splice(0, 1);
		}
		if (sliceArgStr.length - pointer) {
			$.p(stack, {
				type: "arg",
				value: sliceArgStr.substring(pointer, sliceArgStr.length)
			})
		}
		return stack;
	},
	parseIte = function(arr) {
		var result = "";
		$.E(arr, function(block, index) {
			if (block.type === "arg") {
				!block.parse && (block.parse = "{(" + block.value + ")}");
			}
			if (!block.value) {
				block.ignore = $TRUE;
			}
		});
		$.E(arr, function(block, index) {
			if (block.type === "ope") {
				var prev = arr[index - 1],
					next = arr[index + 1];
				if (block.num === 1) {
					if (prev && prev.type === "arg") { //a++
						block.parse = "{$" + block.value + "(" + prev.parse + ")}";
						prev.ignore = $TRUE;
					} else { //++a
						next.parse = "{" + block.value + "(" + next.parse + ")}"
						block.ignore = $TRUE;
					}
				} else if (block.num === 2) {
					next.parse = "{" + block.value + "(" + prev.parse + next.parse + ")}"
					prev.ignore = $TRUE;
					block.ignore = $TRUE;
				} else {
					throw "Unknown type:" + block.value
				}
			}
		});
		$.E(arr, function(block) {
			if (!block.ignore) {
				result += block.parse;
			}
		});
		return result; //arr;
	};