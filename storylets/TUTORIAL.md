# MQBN Tutorial

In this tutorial we will set up a simple story using stoylets with MQBN. For this example, we are heading back to the farm for a simple story of love and routine.

You can download the complete game [in twee form](farm.twee), or as a [playable story](farm.html).

## Basics

For this story we will set up a simple cyclic sequence of seasons, and tie those to storylets, with different storylets available in different seasons. Two more stories, related to our love affair, will be available regardless of season.

---
## Setup

To begin, place the following in **StoryInit**

```html
<<storyletsinit>>
<<sequence "$season" cycling "Spring" "Summer" "Autumn" "Winter">>
```

This sets up storylets (using the default storylets store) and creates a season sequence.

Now create **Farm** and put the following in it:

```html
! $season (year <<=MQBN.sequenceCount("$season")>>)

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

This passage is our hub. It gets available storylets using `MQBN.getStorylets()` and then displays them in a list using `<<storyletlink>>`. If no activities are available, it allows you to just advance to the next season. If you test the game now you will be able to move from season to season, watching the season and year counter (which we access with `MQBN.sequenceCount()`) changing.

---
## Add Storylets

To begin with, we will create some storylets for the seasonal activites we can engage with on the farm. Add the following to **StoryInit**

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

This creates four activities, one each for Spring and Summer, and two for Autumn. There's none for Winter, so Winter will continue to display the "there is nothing to do" message. Since all the storylets are `sticky`, they will be available even if you have already done them, creating a regular cycle of activities around the farm.

For each storylet, create a corresponding passage (e.g. "Plating", "Mowing"), and add some text. I won't list all the text here, you can find it in the [game file](farm.twee), but here's an example for the Apple Picking:

```html
You join the women and children harvesting the orchard, shaking the trees to bring down the apples and then gathering them in broad woven baskets. All this will go to ale, or to feed the pigs.

<<link [[Back to the Farm|Farm]]>><<sequenceadvance "$season">><</link>>
```

All the passages end with a link back to the farm that advances the season.

---
## Randomisation

If you refresh the **Farm** passage in Summer you will notice that the order of the activities changes as you reload. This is because storylets are being randomised and picked each time the passage loads. If you follow this model in a real game, you may want to make sure that the player can't just refresh their way to a better list of stories by setting `State.prng.init();` in your story javascript.

---
## Love

Let's add our love story.

Make two new passages, **Assignation** and **Leave**, and then add the following storylets to the list in **StoryInit**.

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

**Assignation** is available in all the seasons that are not "Winter", so now "Spring", "Summer" and "Autumn" will have two choices each until the assignation is chosen. Note that we use the `link` attribute to change the text that's displayed in the `<<storyletlink>>`. In the corresponding passage the player has a brief romantic encounter with Rowan, until it's broken up by their warring parents.

**Leave** is available in "Summer" and "Autumn" (no leaving the farm in Winter or Spring), but only after "Assignation" has been played. It is `priority: 1`, so it will be the first available choice every time it comes up. In the corresponding passage the player can elope with Rowan and end the game. If they don't, they never get another chance, because **Leave** is not `sticky`.

Both these storylets have a `weight` of 1, which means they will appear at the bottom of the list of returned storylets.

To help set up this romance, add a significant glance between the player and Rowan while apple picking, but only if Rowan has not left (i.e. if **Leave** has not been played).

```html
You join the women and children harvesting the orchard, shaking the trees to bring down the apples and then gathering them in broad woven baskets. All this will go to ale, or to feed the pigs.

<<if !MQBN.played("Leave")>>As you head home, Rowan catches your eye and smiles shyly.
<</if>>\

<<link [[Back to the Farm|Farm]]>><<sequenceadvance "$season">><</link>>
```

Of course, you could as easily test this with a normal `visited("Assignation")` check, or by setting a story variable, but this is meant to be a MQBN tutorial, so we will use an MQBN function.

---
## Further Embelishment

You could easily embellish this game by adding more activities, some `sticky` and some not, to create a series of encounters to play through. Rowan's story could be extended over more episodes, using "played" requirements to order them, or make them exclusive. Similarly other storylets could be locked behind the passing of time as measured by the year counter, with a requirement of `{ type: "sequence", seq: "$season", op: "gte", count: 3 }`, or use a `rand` requirement to make more uncommon activities that don't show up every year.