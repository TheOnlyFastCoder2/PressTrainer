import type { ILangs, IPos } from "./types";


const chars: ILangs = {
  eng:   
  [
    "q","w","e","r","t","y","u","i","o","p",
    "a","s","d","f","g","h","j","k","l",
    "z","x","c","v","b","n","m"
  ],
  rus: [
    "й","ц","у","к","е","н","г","ш","щ","з","х","ъ",
    "ф","ы","в","а","п","р","о","л","д","ж","э",
     "я","ч","с","м","и","т","ь","б","ю",
  ]
}

class Char {
  public x:number = 0;
  public y:number = 0;
  public char: string = '';

  private maxWidth: number;
  private maxHeight: number;
  private cbForRemove?: Function;

  constructor(x:number, y: number, lang: keyof ILangs, maxWidth: number, maxHeight: number, cbForRemove:Function) {
    const i = Math.floor(Math.random() * chars[lang].length);
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this.char = chars[lang][i];
    this.x = x;
    this.y = y;

    this.cbForRemove = cbForRemove;
  }

  toCenter(arr:Char[], stepCell: number, minRadius: number, sizeCell: number) {
    const xCenter = (this.maxWidth - minRadius + sizeCell)/2;
    const yCenter = (this.maxHeight - minRadius + sizeCell)/2;
    const pos = Math.abs(this.x - this.y);

    if(pos >= 0 && pos <= stepCell+1) {
      this.cbForRemove && this.cbForRemove();
      return this.removeSelf(arr);
    }
    else {

        Math.abs(this.x - xCenter) >= stepCell-1 && (
          this.x = this.x <= xCenter ? this.x + stepCell : this.x - stepCell
        );
        Math.abs(this.y - yCenter) >= stepCell-1 && (
          this.y = this.y <= yCenter ? this.y + stepCell : this.y - stepCell
        );
    } 

    return arr;
  }

  removeSelf(arr:Char[]) {
    return arr.filter((cell) => cell != this);
  } 

  removeByIndex(arr:Char[], index:number) {
    arr.splice(index, 1);
    return arr;
  }
}

export default class Trainer {
  private readonly radiusCell = 4;
  private readonly sizeCellDeafault = 45;
  public stepCell = 0.6;
  private minRadius = 90;
  public currLang: keyof ILangs = 'eng';
  private sizeCell = this.sizeCellDeafault;

  private chars:Char[] = new Array();
  private spwanPoins:IPos[] = new Array();

  public width:number = 0;
  public height:number = 0;
  public currSpawn = 0;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D)  {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  init(width: number, height: number) {
    this.canvas.width = this.width = width;
    this.canvas.height = this.height = height;
    const qnty = 20;
    for(let i = 0; i < qnty; i++) {
      this.createSpawn(i, this.minRadius*3, qnty);
    }
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  private setText (x:number, y: number, char: string) {
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font = `600 ${24}px sans-serif`;
    this.ctx.fillStyle = '#28515e';
    this.ctx.fillText(
      char,
      x + this.sizeCell/2,
      y + this.sizeCell/2,  
    );
  }

  private drawRadius() {
    this.ctx.beginPath();
    this.ctx.strokeStyle = "#305F6E";
    this.ctx.arc(this.width/2, this.height/2, 10, 0, 2 * Math.PI);
    this.ctx.stroke();
  }
  

  private drawRect(x:number, y:number, color:string,  char?:string) {
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.roundRect(
      x,y,
      this.sizeCell,
      this.sizeCell,
      this.radiusCell
    )
    this.ctx.fill();

    char && this.setText(x, y, char);
    this.ctx.stroke();
    this.drawRadius();
  }

  public reset() {
    this.currSpawn = 0;
    this.chars = new Array();
    this.clearCanvas();
  }

  private createSpawn(index: number, radius:number, qnty: number) {
    const x = (this.width-this.sizeCell)/2 - Math.cos(index * Math.PI/qnty*2) * (radius+this.sizeCell);
    const y = (this.height-this.sizeCell)/2 - Math.sin(index * Math.PI/qnty*2) * (radius+this.sizeCell);
    this.spwanPoins.push({x, y});
  }

  createCell(cb:Function) {
    const {x, y} = this.spwanPoins[this.currSpawn%this.spwanPoins.length];
    const char = new Char(x, y, this.currLang, this.width, this.height, cb);
    this.chars.push(char);
    this.currSpawn++;
  }

  checkPressedChar(char: string): boolean {
    let bool = false;
    this.chars.every((item, i) => {
      if(item.char === char) {
        bool = true;
        item.removeByIndex(this.chars, i);
        return false;
      }
      return true;
    });

    return bool;
  }

  draw() {
    this.clearCanvas();
    this.spwanPoins.forEach((item, i) => {
      if(this.currSpawn%this.spwanPoins.length === i)
        this.drawRect(item.x, item.y, '#28515e');
    });
    this.chars.forEach((item) => {
      this.drawRect(item.x, item.y, '#5CC2E3', item.char);
      this.chars = item.toCenter(this.chars, this.stepCell, this.minRadius, this.sizeCell);
    });
  }
}