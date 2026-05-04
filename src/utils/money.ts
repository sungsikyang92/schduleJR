const formatter = new Intl.NumberFormat("ko-KR");

export function money(value: number) {
  return `${formatter.format(value)}원`;
}

export function privateMoney(value: number, showMoney: boolean) {
  return showMoney ? money(value) : "******";
}
