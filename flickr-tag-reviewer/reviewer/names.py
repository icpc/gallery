"""Heuristics for deciding whether two person names are likely the same.

Used by duplicate detection so a suggestion is flagged when the same person is
already tagged on a photo even if the tag is written differently:

  * exact name match                         "James Comer"  vs "James Comer"
  * same name parts, different order          "James Comer"  vs "Comer James"
  * a nickname stands in for a given name      "Bill Poucher" vs "William Poucher"
  * nickname *and* reordered                   "Bill Poucher" vs "Poucher William"
  * a middle name present on only one side     "James Earl Comer" vs "James Comer"

It deliberately does NOT match on a single shared surname alone (e.g. two
different "Smith"s), which would be far too noisy.
"""
from __future__ import annotations

import re

# Common English nickname / short form -> canonical given name. Lets us treat
# "Bill" and "William" (etc.) as the same first name when comparing.
NICKNAMES = {
    "bill": "william", "billy": "william", "will": "william", "willy": "william",
    "bob": "robert", "bobby": "robert", "rob": "robert", "robbie": "robert",
    "dick": "richard", "rick": "richard", "ricky": "richard", "rich": "richard", "richie": "richard",
    "jim": "james", "jimmy": "james", "jamie": "james",
    "joe": "joseph", "joey": "joseph",
    "mike": "michael", "mickey": "michael", "mick": "michael",
    "tom": "thomas", "tommy": "thomas",
    "dave": "david", "davy": "david",
    "dan": "daniel", "danny": "daniel",
    "chris": "christopher",
    "steve": "stephen", "steven": "stephen",
    "tony": "anthony",
    "ed": "edward", "eddie": "edward", "ted": "edward", "teddy": "edward", "ned": "edward",
    "ben": "benjamin", "benny": "benjamin",
    "sam": "samuel", "sammy": "samuel",
    "alex": "alexander", "al": "alexander",
    "andy": "andrew", "drew": "andrew",
    "matt": "matthew",
    "nick": "nicholas",
    "greg": "gregory",
    "jeff": "jeffrey",
    "ken": "kenneth", "kenny": "kenneth",
    "larry": "lawrence",
    "ron": "ronald", "ronnie": "ronald",
    "fred": "frederick", "freddie": "frederick",
    "pat": "patrick",
    "pete": "peter",
    "phil": "philip", "phillip": "philip",
    "ray": "raymond",
    "vince": "vincent",
    "walt": "walter",
    "gabe": "gabriel",
    "nate": "nathaniel", "nathan": "nathaniel",
    "gene": "eugene",
    "hank": "henry",
    "jack": "john", "johnny": "john", "jon": "john",
    "frank": "francis", "frankie": "francis",
    "art": "arthur",
    "charlie": "charles", "chuck": "charles",
    "tim": "timothy",
    "marty": "martin",
    "abe": "abraham",
    "kate": "catherine", "katie": "catherine", "kathy": "catherine", "cathy": "catherine",
    "liz": "elizabeth", "beth": "elizabeth", "betty": "elizabeth", "lizzie": "elizabeth", "eliza": "elizabeth",
    "maggie": "margaret", "meg": "margaret", "peggy": "margaret",
    "sue": "susan", "suzie": "susan", "susie": "susan",
    "becky": "rebecca",
    "jen": "jennifer", "jenny": "jennifer",
    "trish": "patricia", "patty": "patricia", "tricia": "patricia",
    "deb": "deborah", "debbie": "deborah",
    "barb": "barbara",
    "vicky": "victoria", "vickie": "victoria",
    "cindy": "cynthia",
    "angie": "angela",
    "jess": "jessica",
    "kim": "kimberly",
    "mandy": "amanda",
    "tina": "christina",
    "abby": "abigail",
}


def _tokens(name: str) -> list[str]:
    """Lowercase alphanumeric word tokens, e.g. 'James  O'Brien-Comer' -> [james, o, brien, comer]."""
    return [t for t in re.split(r"[^a-z0-9]+", (name or "").lower()) if t]


def _norm(name: str) -> str:
    """Collapse whitespace + lowercase for an exact same-order comparison."""
    return " ".join(_tokens(name))


def _canonical_set(name: str) -> set[str]:
    """Order-independent set of name parts with nicknames folded to canonical form."""
    return {NICKNAMES.get(t, t) for t in _tokens(name)}


def same_person(a: str, b: str) -> bool:
    """True if names a and b are likely the same person (see module docstring)."""
    if not (a and a.strip()) or not (b and b.strip()):
        return False
    if _norm(a) == _norm(b):  # exact (order-sensitive) match
        return True
    sa, sb = _canonical_set(a), _canonical_set(b)
    if not sa or not sb:
        return False
    if sa == sb:  # same parts (any order), nicknames folded in
        return True
    # Require >=2 shared canonical parts so a single common surname (e.g. two
    # different "Smith"s) is NOT treated as a duplicate.
    return len(sa & sb) >= 2


def matches_any(name: str, candidates) -> bool:
    """True if `name` likely matches any name in `candidates`."""
    return any(same_person(name, c) for c in candidates)
