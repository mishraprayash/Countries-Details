import { describe, it, expect, vi, afterEach } from "vitest";
import {
  shuffleArray,
  getRandomSubset,
  groupBy,
  unique,
  sortByNumeric,
} from "./array";

describe("array utilities", () => {
  describe("shuffleArray", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("returns a new array and does not mutate the original array", () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      const result = shuffleArray(original);

      expect(result).not.toBe(original);
      expect(original).toEqual(originalCopy);
    });

    it("handles an empty array", () => {
      const result = shuffleArray([]);
      expect(result).toEqual([]);
    });

    it("handles a single-element array", () => {
      const result = shuffleArray([42]);
      expect(result).toEqual([42]);
    });

    it("contains all original elements after shuffling", () => {
      const original = ["a", "b", "c", "d"];
      const result = shuffleArray(original);

      expect(result).toHaveLength(original.length);
      expect(result).toEqual(expect.arrayContaining(original));
    });

    it("shuffles array deterministically based on Math.random", () => {
      // Mock Math.random to return predictable values
      // For i = 3 (element 'd'), j = Math.floor(0.1 * 4) = 0 -> swap index 3 and 0
      // For i = 2 (element 'c'), j = Math.floor(0.1 * 3) = 0 -> swap index 2 and 0
      // For i = 1 (element 'b'), j = Math.floor(0.1 * 2) = 0 -> swap index 1 and 0
      vi.spyOn(Math, "random").mockReturnValue(0.1);

      const original = [1, 2, 3, 4];
      const result = shuffleArray(original);

      expect(result).toEqual([2, 3, 4, 1]);
    });
  });

  describe("getRandomSubset", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("returns a subset of specified length", () => {
      const original = [10, 20, 30, 40, 50];
      const count = 3;
      const result = getRandomSubset(original, count);

      expect(result).toHaveLength(count);
      result.forEach((item) => {
        expect(original).toContain(item);
      });
    });

    it("does not mutate the original array", () => {
      const original = [1, 2, 3];
      const originalCopy = [...original];
      getRandomSubset(original, 2);

      expect(original).toEqual(originalCopy);
    });

    it("returns an empty array when count is 0", () => {
      const original = [1, 2, 3];
      const result = getRandomSubset(original, 0);

      expect(result).toEqual([]);
    });

    it("returns all elements when requested count exceeds array length", () => {
      const original = ["a", "b"];
      const result = getRandomSubset(original, 5);

      expect(result).toHaveLength(original.length);
      expect(result).toEqual(expect.arrayContaining(original));
    });

    it("handles empty array input", () => {
      const result = getRandomSubset([], 3);
      expect(result).toEqual([]);
    });
  });

  describe("groupBy", () => {
    it("groups objects by a string property key", () => {
      const items = [
        { id: 1, category: "fruit", name: "apple" },
        { id: 2, category: "vegetable", name: "carrot" },
        { id: 3, category: "fruit", name: "banana" },
      ];

      const grouped = groupBy(items, (item) => item.category);

      expect(grouped).toEqual({
        fruit: [
          { id: 1, category: "fruit", name: "apple" },
          { id: 3, category: "fruit", name: "banana" },
        ],
        vegetable: [{ id: 2, category: "vegetable", name: "carrot" }],
      });
    });

    it("handles empty array input", () => {
      const grouped = groupBy([], (item: { type: string }) => item.type);
      expect(grouped).toEqual({});
    });

    it("groups by custom derived key function", () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const grouped = groupBy(numbers, (num) =>
        num % 2 === 0 ? "even" : "odd"
      );

      expect(grouped).toEqual({
        odd: [1, 3, 5],
        even: [2, 4, 6],
      });
    });
  });

  describe("unique", () => {
    it("removes duplicate primitive values", () => {
      const input = [1, 2, 2, 3, 1, 4, 4, 5];
      const result = unique(input);

      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it("preserves order of first appearance", () => {
      const input = ["b", "a", "b", "c", "a"];
      const result = unique(input);

      expect(result).toEqual(["b", "a", "c"]);
    });

    it("handles empty array", () => {
      expect(unique([])).toEqual([]);
    });

    it("returns same values when array already has unique elements", () => {
      const input = [10, 20, 30];
      expect(unique(input)).toEqual([10, 20, 30]);
    });
  });

  describe("sortByNumeric", () => {
    interface Item {
      name: string;
      score: number;
    }

    const items: Item[] = [
      { name: "Alice", score: 85 },
      { name: "Bob", score: 92 },
      { name: "Charlie", score: 78 },
    ];

    it("sorts in descending order by default", () => {
      const sorted = sortByNumeric(items, (item) => item.score);

      expect(sorted).toEqual([
        { name: "Bob", score: 92 },
        { name: "Alice", score: 85 },
        { name: "Charlie", score: 78 },
      ]);
    });

    it("sorts in ascending order when descending parameter is false", () => {
      const sorted = sortByNumeric(items, (item) => item.score, false);

      expect(sorted).toEqual([
        { name: "Charlie", score: 78 },
        { name: "Alice", score: 85 },
        { name: "Bob", score: 92 },
      ]);
    });

    it("does not mutate the original array", () => {
      const itemsCopy = JSON.parse(JSON.stringify(items));
      sortByNumeric(items, (item) => item.score);

      expect(items).toEqual(itemsCopy);
    });

    it("handles empty array", () => {
      const sorted = sortByNumeric([], (item: { score: number }) => item.score);
      expect(sorted).toEqual([]);
    });

    it("handles elements with equal values", () => {
      const equalItems = [
        { name: "A", score: 50 },
        { name: "B", score: 50 },
      ];
      const sorted = sortByNumeric(equalItems, (item) => item.score);

      expect(sorted).toHaveLength(2);
      expect(sorted.map((i) => i.score)).toEqual([50, 50]);
    });
  });
});
