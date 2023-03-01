

export default class Controller {
    #view 
    #worker
    #camera
    #blinkCounter= 0
    constructor({ View, Service, Worker, Camera }) {
        this.#view = View
       
        this.#camera = Camera
        this.#worker = this.#configurateWorker(Worker)
        this.#view.configureButtonClick(this.onBtnStart.bind(this))


    }

    logger( text) {
        const times = `      - blinked times: ${this.#blinkCounter}`
        this.#view.log(`status: ${text}`.concat(this.#blinkCounter ? times : ""))
    }


    #configurateWorker(worker) {
        let ready = false
        let blinkedLeftEyeCounter = 0
        let blinkedRightEyeCounter = 0
        worker.onmessage = ({data}) => {
          
            if ('READY' === data) {
              
                this.#view.enableButton()
                console.log('ready')
                ready = true
                return
            }

            const {blinked, blinkedLeftEye, blinkedRightEye} = data
            this.#blinkCounter += blinked 

            console.log('blinked', blinked)
            console.log('blinkedLeftEye', blinkedLeftEye)
            console.log('blinkedRightEye', blinkedRightEye)



            if (blinkedLeftEye && !blinkedRightEye){
                this.#view.togglePlayPause()
                blinkedLeftEyeCounter += blinkedLeftEye
                console.log('blinkeLeftEye',blinkedLeftEyeCounter)
            } else if (blinkedRightEye && !blinkedLeftEye){
                this.#view.togglePlayPause()
                blinkedRightEyeCounter += blinkedRightEye
                console.log('blinkeRightEye',blinkedRightEyeCounter)
            }
            this.#view.togglePlayPause()
            console.log('blinkeTwoEyes',this.#blinkCounter)
            

        }
        return {
            send(msg) {
                if (!ready) return
                worker.postMessage(msg)

            }
        }
    }

    loop () {
        const video = this.#camera.video
     
        const img = this.#view.getVideoFrame(video)
        this.#worker.send(img)

        
        this.logger('detecting eye blink...')
        setTimeout(() => this.loop(), 100)
    }

    static async initialize (deps) {
        const controller = new Controller(deps)
        controller.logger("not detecting eye blink, click in the button")
        return controller.init()
    }

    async init () {
        // console.log(this.#view)
    }

    onBtnStart(){
        this.logger("detecting eye blink")
        this.#blinkCounter = 0
        this.loop()
    }
   
} 