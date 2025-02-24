export interface IHeaderButton {
  title: string;
  logo?: string;
  items: IHeaderMenuItem[];
}

export interface IHeaderMenuItem {
  title: string;
  separator: boolean;
  rightLabel?: string;
}
