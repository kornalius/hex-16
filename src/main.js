require('file?name=[name].[ext]!../node_modules/pixi.js/bin/pixi.js')
require('file?name=[name].[ext]!../bower_components/Wad/build/wad.min.js')

import css from '../style/main.css'
import t from '../html/main.html'

import globals from './globals.js'
import { interrupts } from './interrupts.js'
import { sprites } from './sprites.js'
import { palettes } from './palettes.js'
import { sounds } from './sounds.js'
import { vm } from './vm.js'

var el = document.createElement('div');
el.innerHTML = t;
document.body.appendChild(el);
