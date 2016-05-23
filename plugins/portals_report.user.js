// ==UserScript==
// @id             iitc-plugin-portals_report@pfsmorigo
// @name           IITC plugin: Report Status
// @category       Keys
// @version        0.1
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @description    Exports a report of portals state
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==

function wrapper() {
    // in case IITC is not available yet, define the base plugin object
    if (typeof window.plugin !== "function") {
        window.plugin = function() {};
    }
    // base context for plugin
    window.plugin.portals_report = function() {};
    var self = window.plugin.portals_report;
    self.gen = function gen() {
        var o = [];
		var guid = [];
		var mod_list = "";
		var reso_list = "";
		var reso_counter = 0;

		var list = window.plugin.bookmarks.bkmrksObj['portals'];
		for(var idFolders in list) {
			var folder = list[idFolders];
            if (folder.label != "Report") continue;
            var fold = folder['bkmrk'];
			for(var idBkmrk in fold) {
				var bkmrk = fold[idBkmrk];
                guid.push(bkmrk['guid']);
			}
		}

		for (i = 0; i < guid.length; i++)
			renderPortalDetails(guid[i]);

		for (i = 0; i < guid.length; i++) {
			var details = window.portalDetail.get(guid[i]);
			if (details) {
				//o.push('<b>Portal details:</b><pre>'+JSON.stringify(details, null, 2)+'</pre>');
				o.push("[L" + details.level + "] " + details.title);

				for (j = 0, len = details.resonators.length; j < len; j++) {
					if (details.resonators[j] !== null)
						if (details.resonators[j].level == 8) {
							reso_list += details.resonators[j].owner + ", ";
							reso_counter++;
						}
				}
				reso_list = reso_list.replace(/,\s*$/, "");
				o.push("R8 (" + reso_counter + "): " + reso_list);

				for (j = 0, len = details.mods.length; j < len; j++) {
					if (details.mods[j] !== null) {
						mod = details.mods[j].rarity + details.mods[j].name;

						mod = mod.replace("Portal Shield", "PS");
						mod = mod.replace("Multi-hack", "MH");
						mod = mod.replace("Heat Sink", "HS");
						mod = mod.replace("RARELink Amp", "LA");
						mod = mod.replace("RARETurret", "T");
						mod = mod.replace("RAREForce Amp", "FA");
						mod = mod.replace("VERY_RAREAXA Shield", "AXA");
						mod = mod.replace("VERY_RARE", "VR");
						mod = mod.replace("RARE", "R");
						mod = mod.replace("COMMON", "");

						mod_list += mod + " (" + details.mods[j].owner + "), ";
					}
				}
				mod_list = mod_list.replace(/,\s*$/, "");
				o.push("Mods: " + mod_list);

				o.push(" ");
			}
			mod_list = "";
			reso_list = "";
			reso_counter = 0;
        }

        var dialog = window.dialog({
            title: "Portal Report",
            html: '<span>Summary of portal current state</span>'
            + '<textarea id="idmCSVExport" style="width: 600px; height: ' + ($(window).height() - 150) + 'px; margin-top: 5px;"></textarea>'
        }).parent();
        $(".ui-dialog-buttonpane", dialog).remove();
        // width first, then centre
        dialog.css("width", 630).css({
            "top": ($(window).height() - dialog.height()) / 2,
            "left": ($(window).width() - dialog.width()) / 2
        });
        $("#idmCSVExport").val(o.join("\n"));
        return dialog;
    };
    // setup function called by IITC
    self.setup = function init() {
        // add controls to toolbox
        var link = $("<a onclick=\"window.plugin.portals_report.gen();\" title=\"Generate a report of portals state.\">Report</a>");
        $("#toolbox").append(link);
        // delete setup to ensure init can't be run again
        delete self.setup;
    };
    // IITC plugin setup
    if (window.iitcLoaded && typeof self.setup === "function") {
        self.setup();
    } else if (window.bootPlugins) {
        window.bootPlugins.push(self.setup);
    } else {
        window.bootPlugins = [self.setup];
    }
}
// inject plugin into page
var script = document.createElement("script");
script.appendChild(document.createTextNode("(" + wrapper + ")();"));
(document.body || document.head || document.documentElement).appendChild(script);

