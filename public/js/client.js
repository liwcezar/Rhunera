/*
 Client Side JS for RockMUD
 Rocky Bevins, moreoutput@gmail.com 2012
*/
 require(['dojo/dom', 'dojo/string', 'dojo/query', 'dojo/dom-attr', 'dojo/on', 'dojo/_base/event', 'dojo/window', 'dojo/ready', 'dojo/NodeList-dom'], 
	function (dom, string, query, domAttr, on, event, win, ready) {
		ready(function () {
			'use strict';
			var ws = io.connect(''),
			terminal = dom.byId('terminal'),
			/* Command aliases are loaded by the client */
			aliases = {
				l: 'look',
				i: 'inventory',
				sc: 'score',
				n: 'north',
				e: 'east',
				w: 'west',
				s: 'south',
				u: 'up',
				d: 'down',
				eq: 'equipment',
				q: 'quaff',
				c: 'cast',
				k: 'kill',
				re: 'rest',
				sl: 'sleep',
				wh: 'where'
			},	

			display = function(r) {
				if (r.element === 'undefined') {
					terminal.innerHTML += '<p><div class="' + r.styleClass + '">' + r.msg + '</div></p>';
				} else {
					terminal.innerHTML += '<' + r.element + '><div class="' + r.styleClass + '">' + r.msg + '</div></' + r.element + '>';
				}

				return parseCmd(r);
			},
			parseCmd = function(r) {
				if (r.msg != undefined) {
					r.msg = r.msg.replace(/ /g, '_');
					ws.emit(r.emit, r);
				}
			},
			changeMudState = function(state) {
				domAttr.set(dom.byId('cmd'), 'mud-state', state);
			},		
			
			checkAlias = function(cmd, fn) {
				var keys = Object.keys(aliases),
				i = 0,
				cmd = cmd.replace(/_.*/, '').toLowerCase(),
				msg = cmd.replace(/^.*?_/, '').replace(/_/g, ' ');			
			
				for (i; i < keys.length; i += 1) {
					if (keys[i] === cmd) {
						return fn(aliases[keys[i]] + ' ' + msg);
					}	
				}		

				return fn(cmd);				
			};
				
			ws.on('msg', function(r) {
				display(r);
				
				if (r.res) {
					changeMudState(r.res);	
				}
			});			
				
			var frmH = on(dom.byId('console'), 'submit', function (e) {				
				var node = dom.byId('cmd'),
				messageNodes = [],
				msg = string.trim(node.value.toLowerCase());
				
				e.preventDefault();
				
				display({
					msg : checkAlias(msg, function(cmd) {
						return cmd;
					}),
					emit : (function () {
						var res = domAttr.get(node, 'mud-state');

						if (res === 'login') {
							return 'login';
						} else if (msg === 'quit' || msg === 'disconnect') {
							return 'quit';
						} else if (res === 'selectRace') {
							return 'raceSelection';
						} else if (res === 'selectClass') {
							return 'classSelection';
						} else if (res === 'createPassword') {
							return 'setPassword';
						} else if (res === 'enterPassword') {
							return 'password';
						} else {
							return 'cmd';
						}
					}()),
					styleClass: 'cmd'
				});
					
				node.value = '';
				node.focus();
				
				messageNodes = query('#terminal div');
				win.scrollIntoView(messageNodes[messageNodes.length - 1]);	
			});
		});
	});