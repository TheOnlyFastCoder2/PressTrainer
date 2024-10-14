class Update {
  timer:number = 0;
  updateFrequency:number = 0;
  updateFrequencyStep:number = 0;
}

class RequesAnimation  {
  public frameID: number = 0;
  private timer:number = 0;

  private callback: Function|undefined;
  private updateFrequency:number = 0;
  private updateFrequencyStep:number = 0;

  private totalTime:number = 0;
  private startTime:number = performance.now();
  private isCanvasVisible = true;

  private readonly deviation = 4;
  private readonly deltaNorm = 1000/60 + this.deviation;

  init (
    freq:number, 
    freqStep:number,
    callback: (deltaTime: number) => void
  ) 
  { 
    this.callback = callback;
    this.updateFrequency = freq;
    this.updateFrequencyStep = freqStep;
  }

  getStart() {
    this.isCanvasVisible = true;
  }
  getStop() {
    this.isCanvasVisible = false;
  }
  
  setSpeedUp () {this.updateFrequency -= this.updateFrequencyStep; }
  setSpeedDown () {this.updateFrequency += this.updateFrequencyStep; }
  
  toFixFloat(digit: number):number {
    return Math.floor(digit);
  }

  get getMilliseconds() {
    return this.totalTime;
  }

  get getSeconds () {
    return this.toFixFloat((this.totalTime / 1000) % 60);
  }

  get getMinutes () {
    return this.toFixFloat((this.totalTime / 1000 / 60) % 60);
  }
  
  get getHouse () {
    return this.toFixFloat((this.totalTime / 1000 / 60 / 60) % 24);
  }

  toBindContextToCallback() {
    this.callback = this.callback?.bind(null, this);
  }

  winTarget() {
    window.onfocus = () => {
      this.getStart();
      this.toStartFrame();
      
    }
    window.onblur = () => {
      this.getStop();
      this.cancelFrameAnimation();
    }
  } 
  
  cancelFrameAnimation () {
    cancelAnimationFrame(this.frameID);
  }

  toStartFrame()  {
    const deltaTime = (performance.now() - this.startTime) - this.totalTime;
    this.totalTime = deltaTime + this.totalTime;

    if(this.isCanvasVisible && deltaTime < this.deltaNorm) {
      this.update(deltaTime,this.callback!);
    }

    this.cancelFrameAnimation();
    this.frameID = window.requestAnimationFrame(
      this.toStartFrame.bind(this)
    );
  }

  private update(deltaTime: number, callback:Function) {
    this.timer += deltaTime / 1000; 
    if(this.timer > this.updateFrequency) {
      this.timer -= this.updateFrequency;
      callback.call(null, deltaTime);
    }
  }

  costomUpdate(freq:number, callback:Function) {
    const self = new Update();
    self.updateFrequency = freq;
    return (deltaTime: number, newFreq?: number) => {
      self.timer += deltaTime / 1000; 
      if(self.timer > self.updateFrequency) {
        self.timer -= self.updateFrequency;
        callback();
      }

      newFreq && (
        self.updateFrequency = newFreq
      );
    }
  }
}

export default RequesAnimation;