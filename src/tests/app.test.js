import app from "../App";

it("works", () => {
  console.log(app);
  expect(1 + 1).toBe(2);
});

it("doesn't work", () => {
  expect(1 + 1).toBe(2);
});
