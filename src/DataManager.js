/*
 * DataManager constructor
 */
// var _hasOwn = Object.prototype.hasOwnProperty;

function DataManager(baseData, viewInstance) {
	var self = this;
	if (!(self instanceof DataManager)) {
		return new DataManager(baseData, viewInstance);
	}
	baseData = baseData || {};
	self.id = $.uid();
	self._database = baseData;
	self._cacheData = {};
	self._viewInstances = []; //to touch off
	self._parentDataManager = $NULL; //to get data
	self._subsetDataManagers = []; //to touch off
	self._triggerKeys = [];
	viewInstance && self.collect(viewInstance);
	DataManager._instances[self.id] = self;
};

global.DataManager = DataManager;
DataManager._instances = {};
DataManager.config = {
	"$T": "$THIS",
	"$P": "$PARENT"
}
DataManager.prototype = {
	getNC: function(key) {
		var arrKey = key.split("."),
			result = this._database;
		if (key !== "") { //"" return _database
			// if (result instanceof Object) {=
			// if (!(result == undefined || (isNaN(result) && (typeof result === "number")))) { //null|undefined|NaN
			if (result != $UNDEFINED&&result!==$FALSE) { //null|undefined|false
				do {
					// console.log(arrKey[0])
					result = result[arrKey.splice(0, 1)];
				} while (result !== $UNDEFINED && arrKey.length);
			}
			// } else {
			// 	result =
			// }
		}
		return result;
	},
	get: function(key, refresh) {
		var self = this,
			$T = DataManager.config.$T,
			$P = DataManager.config.$P,
			baseData = self._database,
			cacheData = self._cacheData,
			result = baseData,
			formateKey = (key || "");
		if (key !== $UNDEFINED) {
			if (!key.indexOf($T)) {
				var $TLen = $T.length;
				if (key.charAt($TLen) === ".") {
					formateKey = key.substring($TLen + 1);
				} else {
					formateKey = key.substring($TLen);
				}
			} else if (!key.indexOf($P)) {
				var $PLen = $P.length;
				if (key.charAt($PLen) === ".") {
					formateKey = key.substring($PLen + 1);
				} else {
					formateKey = key.substring($PLen);
				}
				return self._parentDataManager && self._parentDataManager.get(formateKey);
			}
			//console.log("get:", formateKey);
			if (refresh === $FALSE) {
				result = cacheData[formateKey];
			} else if (refresh === $TRUE || (result = cacheData[formateKey]) === $UNDEFINED) {
				//console.log("refresh:", formateKey);
				if ((result = cacheData[formateKey] = self.getNC(formateKey)) === $UNDEFINED && self._parentDataManager) {
					return self._parentDataManager.get(formateKey);
				};
			}
		}
		return result;
	},
	set: function(key, obj) {
		var self = this,
			baseData = self._database || {},
			result = baseData,
			cacheObj = result,
			arrKey,
			itemKey,
			lastItemKey,
			cacheItemKey,
			updateKeys = ["$THIS"];
		switch (arguments.length) {
			case 0:
				return;
			case 1:
				self._database = key;
				key = "";
				break;
			case 2:
				arrKey = key.split(".");
				lastItemKey = arrKey.splice(arrKey.length - 1, 1)[0];
				while ((cacheItemKey = arrKey.splice(0, 1)).length) {
					itemKey = cacheItemKey[0];
					// //console.log("itemKey:", itemKey, ":", result[itemKey])
					if (!((result = result[itemKey]) instanceof Object)) {
						result = cacheObj[itemKey] = {};
					};
					cacheObj = result
				};
				// //console.log(cacheObj)
				result = cacheObj[lastItemKey] = obj;
				self._database = baseData;
				break;
		}
		$.ftE(self._triggerKeys, function(triggerKey) {
			//console.warn("indexOf:",key.indexOf(triggerKey)===0||triggerKey.indexOf(key)===0)
			// console.log(triggerKey.indexOf(key) === 0)
			if (key.indexOf(triggerKey) === 0 || triggerKey.indexOf(key) === 0) {
				var oldVal = self.get(triggerKey, $FALSE),
					newVal = self.get(triggerKey, $TRUE);
				//console.log("old triggerKey:", oldVal)
				//console.log("new triggerKey:", newVal)
				if (oldVal !== newVal || oldVal instanceof Object) {
					$.p(updateKeys, triggerKey);
				}
			}
		});
		$.ftE($.un(updateKeys), function(triggerKey) {
			self._touchOffSubset(triggerKey)
		});
		// //console.log("updateKeys:",updateKeys)
		return updateKeys;
	},
	_touchOffSubset: function(key) {
		$.fE(this._subsetDataManagers, function(dm) {
			dm._touchOffSubset(key);
		});
		var i, vis, vi, len;
		for (i = 0, vis = this._viewInstances, vi, len = vis.length; vi = vis[i];) {
			if (vi._isAttr) {
				// //console.log("building attribute value!")//DEBUG
				$.fE(vi._triggers, function(key) {
					vi.touchOff(key);
				});
				vi._isAttr.setAttribute(vi, vi.dataManager);
				vi.dataManager.remove(vi);
			} else {
				vi.touchOff(key);
				i += 1;
			}
		}
	},
	_collectTriKey: function(vi) {
		var dm = this,
			triggerKeys = dm._triggerKeys;
		triggerKeys.push.apply(triggerKeys, vi._triggers);
		$.un(triggerKeys);
	},
	collect: function(viewInstance) {
		var dm = this;
		if ($.iO(dm._viewInstances, viewInstance) === -1) {
			viewInstance.dataManager && viewInstance.dataManager.remove(viewInstance);
			$.p(dm._viewInstances, viewInstance);
			viewInstance.dataManager = dm;
			dm._collectTriKey(viewInstance);
		}
		return dm;
	},
	subset: function(viewInstance,baseData) {
		var dm = this,
			subsetDataManager = viewInstance.dataManager;//DataManager(baseData, viewInstance);
		subsetDataManager._parentDataManager = dm;
		if (viewInstance instanceof ViewInstance) {
			viewInstance.dataManager = subsetDataManager;
			viewInstance.reDraw();
			dm._collectTriKey(viewInstance);
		}
		if (arguments.length>1) {
			subsetDataManager.set(baseData);
		}
		$.p(this._subsetDataManagers, subsetDataManager);
		return subsetDataManager; //subset(vi).set(basedata);},
	},
	remove: function(viewInstance) {
		var dm = this,
			vis = dm._viewInstances,
			index = $.iO(vis, viewInstance);
		if (index !== -1) {
			vis.splice(index, 1);
		}
	}
};