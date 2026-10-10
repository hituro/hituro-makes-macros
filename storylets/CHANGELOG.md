# MQBN Changelog

* **v1.5.8 — 2026-10-10**
  Added `tag` condition type
* **v1.5.7 — 2026-06-01**
  BUG FIX: avoid error when attempting to check the state of a store that has not yet been used
* **v1.5.6 — 2025-04-18**  
  BUG FIX: getRandomInt() now returns an Int and not a Float 
* **v1.5.5 — 2025-04-13**  
  Added `noPRNG` option to `rand` requirements  
* **v1.5.4 - 2026-03-17**  
  Updated `played` conditions to have an optional store name  
* **v1.5.3 - 2025-11-01**  
  Updated `<<storyletscan>>` to recognise store names with numbers in them
* **v1.5.2 - 2025-05-11**  
  Fix a bug in `<<sequence>>` that prevents cycling sequences from cycling.  
  Fix a bug in `<<sequenceadvance>>` that can result in the wrong name when incrementing more than 1 step.
* **v1.5.1 - 2024-12-29**  
  Updated `macroPairedArgsParser` to support singleton arguments
* **v1.5 - 2024-08-29**  
  Added the `twinescript (tws)` condition type. Added the `<<storyletinclude>>` macro. 
  Changed syntax for `<<storyletscan>>`. Refactor of the `Sequence` class.  
  Added new syntax for `<<storylet>>` macro.
* **v1.4 - 2023-11-15**  
  BUG FIX: don't initialise a store if it already exists
* **v1.3 - 2023-10-27**  
  BUG FIX: sort negative priority correctly
* **v1.2 — 2023-10-10**   
  Added the `pulls` condition


## With thanks to

* zb123
* Byron the Wildcat
* SjordHekking
* Josh Grams
* Felix Nolan
* Da_Miech
