# MQBN Tutorial

In this tutorial we will set up a simple story using stoylets with MQBN. For this example, we are heading back to the farm for a simple story of love and routine.

You can download the complete game [in twee form](farm.twee), or as a [playable story](farm.html).

## Basics

For this story we will set up a simple cyclic sequence of seasons, and tie those to storylets, with different storylets available in different seasons. Two more stories, related to our love affair, will be available regardless of season.

---
## Setup

Let's get started ...

To begin, make a new SugarCube game in Twine. Open the **Story Javascript** window, and paste the contents of [mqbn.js](mqbn.js) into it.

### StoryInit

Next, create a passage called **StoryInit** (**StoryInit** is a special passage that runs each time your game is loaded), and put the following into it.

```html
<<storyletsinit>>
<<sequence "$season" cycling "Spring" "Summer" "Autumn" "Winter">>
```

The first line, `<<storyletsinit>>`, sets up the MQBN system. You should always put this somewhere in your **StoryInit**. 

The second line, `<<sequence>>`, creates a sequence, a special sort of story variable that can automatically cycle through its values — in this case the seasons. You can access this sequence through the story variable `$season`. You must create sequences (with `<<sequence>>`) before you can use them in your game, so it makes sense to do this in **StoryInit** as well.

> [!WARNING]
> If you *don't* use `<<storyletsinit>>` before you use any of the other MQBN functionality, you will get an error, so don't forget!

### Farm

Now create a passage called **Farm** and put the following in it:

```html
! $season (year $season.count)

It's $season, down on the farm, and as ever there's things to do.

<<nobr>>
    <<set _events = MQBN.getStorylets(3)>>
    <<if _events.length>>
      <ul>
      <<for _event range _events>>
          <li><<storyletlink _event>><</storyletlink>></li>
      <</for>>
      </ul>
    <<else>>
      Although, in fact, there is nothing to do _this_ season. <<link [[Advance to next season|Farm]]>>
          <<sequenceadvance "$season">>
        <</link>>
    <</if>>
<</nobr>>
```

This passage is our hub, and you should set it as the starting point for the story (using the "Start Story Here" button). This code does the following:

1. Displays the current season as a title (using `!` to make a heading), with the current year in parenthesis. `$season` on its own shows the current name of the season, while `$season.count` shows how many times around the sequence the game has gone, i.e. how many years have passed.
2. Calls the javascript function `MQBN.getStorylets()` to get a list of available storylets, and assigns them to the temporary variable `_events`. Calling `MQBN.getStorylets()` with no arguments gets as many storylets as are currently available.
3. Uses a `<<for>>` macro to display a list of the available storylets, using a `<<storyletlink>>` macro to make a clickable link to each one.
4. If no storylets are available (`_events.length` equals 0), it tells you that no activities are available, and gives you a link to advance to the next season. That link uses `<<sequenceadvance>>` to move `$season` on to its next value.

If you test the game now you will be able to move from season to season, watching the season and year counter changing, but no actual activities are available yet (because we have not added any storylets).

> [!NOTE]
> You could also use a normal `<<set>>` macro to change the season, e.g. `<<set $season ++>>`. Changing it in this way will update the associated name and count just like using `<<sequenceadvance>>`

---
## Add Storylets

Your story currently doesn't have any storylets, so there's nothing to do on the farm (the list of season activities is always blank), so let's create some for the seasonal activites we can do.

Add the following to the **StoryInit** passage:

```html
<<set setup.storylets = [
  {
    title: "Planting",
    desc: "Spring Planting",
    all: [ { type: "sequence", seq: "$season", name: "Spring" } ],
    sticky: true
  },
  {
    title: "Mowing",
    desc: "Grass mowing day",
    all: [ { type: "sequence", seq: "$season", name: "Summer" } ],
    sticky: true
  },
  {
    title: "Harvest",
    desc: "Harvest time",
    all: [ { type: "sequence", seq: "$season", name: "Autumn" } ],
    sticky: true
  },
  {
    title: "Apple Picking",
    desc: "Picking apples in the orchard",
    all: [ { type: "sequence", seq: "$season", name: "Autumn" } ],
    sticky: true
  }
]>>
```

This code creates four storylets ("Planting", "Mowing", "Harvest", and "Apple Picking") and puts them in the store called `setup.storylets`. This is the default storylet store, and it's where the code we already put in **Farm** (like `MQBN.getStorylets()` and `<<storyletlink>>`) will look for storylets.

> [!NOTE]
> You could call your store something else if you wanted, such as `setup.farmstories`, but each time you use a storylet function or macro you'll have to tell it to look in `farmstories` instead of `storylets`. Unless you need multiple stores, it's probably easier to leave this as it is.

The four storylets each have a condition that checks the current season, so that there is one each for Spring and Summer, and two for Autumn. There's none for Winter, so Winter will continue to display the "there is nothing to do" message. The condition:
```js
all: [ { type: "sequence", seq: "$season", name: "Spring" } ]
```
— means that "all the following must be true for the story to be available — the sequence $season must be "Spring".

Since all the storylets are `sticky`, they will be available even if you have already done them, creating a regular cycle of activities around the farm.

### Storylet Passages

For each storylet, create a corresponding passage (e.g. **Planting**, **Mowing**), and add some text. I won't list all the text here, you can find it in the [game file](farm.twee), but here's an example for **Apple Picking**:

```html
You join the women and children harvesting the orchard, shaking the trees to bring down the apples and then gathering them in broad woven baskets. All this will go to ale, or to feed the pigs.

<<link [[Back to the Farm|Farm]]>><<sequenceadvance "$season">><</link>>
```

All the passages end with a link back to the farm that advances the season, using `<<sequenceadvance>>` just like in the **Farm** passage.

If you go back to playing the game now, you'll see the appropriate activites come up as links on the **Farm** passage. Clicking any of those links will take you to the appropriate passage, while clicking "Back to the Farm" in those passages will go back to the hub and move the year one season forward.

---
## Love

Let's add our love story.

Make two new passages, **Assignation** and **Leave**, and then add the following storylets to the end of list in **StoryInit** (remembering to put a comma between the "Apple Picking" storylet and the new ones):

```js
  {
    title: "Assignation",
    desc: "Assignation",
    link: "There's work to do ... but you slip away",
    all: [ { type: "sequence", seq: "$season", op: "not", name: "Winter" } ],
    weight: 1
  },
  {
    title: "Leave",
    link: "Leave the farm",
    all: [ 
      { type: "played", story: "Assignation" },
        { type: "any", any: [
          { type: "sequence", seq: "$season", name: "Summer" },
          { type: "sequence", seq: "$season", name: "Autumn" }
        ]}
    ],
    priority: 1,
    weight: 1
  }
```

**Assignation** is available in all the seasons that are not "Winter", so now "Spring", "Summer" and "Autumn" will have two choices each until the assignation is chosen. We use the `link` attribute to change the text that's displayed in the `<<storyletlink>>` — otherwise it would just show the title, "Assignation". In the corresponding passage the player has a brief romantic encounter with Rowan, until it's broken up by their warring parents.

**Leave** is available in "Summer" and "Autumn" (no leaving the farm in Winter or Spring), but only after "Assignation" has been played. It is `priority: 1`, so it will always be chosen, even if there were more than three storylets available. In the corresponding passage the player can elope with Rowan and end the game. If they don't, they never get another chance, because **Leave** is not `sticky`.

Both these storylets have a `weight` of 1, which means they will appear at the bottom of the list of returned storylets.

---
## Romance

Right now, the text of each individual storylet is fixed, not depending on whether you've played one one of the other storylets. Let's chance this, by adding a significant glance between the player and Rowan while apple picking, but only if Rowan has not left (i.e. if **Leave** has not been played).

```html
You join the women and children harvesting the orchard, shaking the trees to bring down the apples and then gathering them in broad woven baskets. All this will go to ale, or to feed the pigs.

<<if !MQBN.played("Leave")>>As you head home, Rowan catches your eye and smiles shyly.
<</if>>\

<<link [[Back to the Farm|Farm]]>><<sequenceadvance "$season">><</link>>
```

> [!NOTE]
> Of course, you could as easily test this with a normal `visited("Assignation")` check, or by setting a story variable, but this is meant to be a MQBN tutorial, so we will use an MQBN function.

---
## Further Embelishment

You could easily embellish this game by adding more activities, some `sticky` and some not, to create a series of encounters to play through. Rowan's story could be extended over more episodes, using "played" requirements to order them, or make them exclusive. Similarly other storylets could be locked behind the passing of time as measured by the year counter, with a requirement of `{ type: "sequence", seq: "$season", op: "gte", count: 3 }`, or use a `rand` requirement to make more uncommon activities that don't show up every year — the farm is your oyster.
