# DATESYSTEM Changelog

* v1.2.0 (2024-09-30)
** `[h12]` and `[0h12]` formats now show midnight as the maximum number of hours in the half day (e.g. 12am rather than 00am)
** `[day_half]` now breaks the day in half at whatever half of `DAY_LENGTH` is, rather than at 12

* v1.1.1 
* v1.1.0 (2024-08-15)
** The `[Y]` date element is now the two digit year, and the `[y]` element is the four digit year, in v1.0 it was the reverse\
** The `moveToTime()` function has been renamed `dateFromPartialDate()`
** Added `<<schedule>>`

* v1.0.2 (2023-09-19)
** Added `<<at>>`

* v1.0.1 (2023-09-14)
** Calculation of days of the week is now correct for historical times, and pre-Gregorian dates

* v1.0.0 (2023-06-15)
** Initial release