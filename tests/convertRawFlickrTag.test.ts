import { describe, expect, it } from "bun:test";

import { convertRawFlickrTag } from "../src/utils/convertRawFlickrTag";

describe("convertRawFlickrTag unit", () => {
  const RAW_TAG_UNIT_PAIRS: ReadonlyArray<readonly [string, string]> = [
    ["photographer$Riverside City College", "photographerriversidecitycollege"],
    ["team$ETH Zürich", "teamethzürich"],
    ["Vinicius Proença(a09e3a30abaf4f85)", "viniciusproençaa09e3a30abaf4f85"],
    [
      "team$Pontificia Universidad Católica de Chile",
      "teampontificiauniversidadcatólicadechile",
    ],
    ["Atacan İyidoğan(c69a5434d7096cd8)", "atacaniyidoğanc69a5434d7096cd8"],
    [
      "team$University of Cambridge 2: Trinity’s Trinity",
      "teamuniversityofcambridge2trinitystrinity",
    ],
    [
      "Michael Douglas GonГ§alves NГіbrega(3645201549fb3db7)",
      "michaeldouglasgonг§alvesnгіbrega3645201549fb3db7",
    ],
    [
      "Adrian Muro Gardu±o(3c59454a4c596921)",
      "adrianmurogardu±o3c59454a4c596921",
    ],
  ];

  for (const [raw, expected] of RAW_TAG_UNIT_PAIRS) {
    it(`decodes raw tag '${raw}'`, () => {
      expect(convertRawFlickrTag(raw)).toBe(expected);
    });
  }
});
