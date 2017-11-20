import Colors from 'Colors'
describe('Colors', () => {
  it('#Colors basic', () => {
    assert.notOk(Colors.get());
    assert.isTrue(Colors.get("0") === Colors.get("0"));
    assert.isTrue(Colors.get("0") !== Colors.get("0_0"));
    assert.isTrue(Colors.get("0_0", "A100") !== Colors.get("0_0"))
    assert.isTrue(Colors.get("0_0", "A700") !== Colors.get("0_0"))
    assert.notOk(Colors.get("0", "A1000"));
  // assert.ok(Colors.get());
  })
})