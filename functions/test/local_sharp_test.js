const sharp = require('sharp')
//requiring path and fs modules
// const path = require('path');
const {cfg,debug,projroot} = require ("./commonTest")

const fs = require('fs');
const { assert } = require('chai');
//joining path of directory 

describe("IMG: Image format conversion",function (){
    // let res=[]
    this.timeout(2000); // A very long environment setup.

    let path =  `${projroot}/functions/test/master/images`
    let files=[];
    
    before('test_all()',async ()=>{

        
        files=fs.readdirSync(path)
        it('files found for testing', function (){
            assert.isAtLeast(files.length,1)
        } )
    })
    
    describe('PNG conversion', function () {
        for (let f of fs.readdirSync(path)){
            // filter
            if (!f.includes('6')) continue;
            if (!f.match(/.*\.(png|jpg)/i) )
                continue;
            it(`Files converted ${f}`, (done)=>{
                procIMG(path, f)
                .then(res=>{
                    debug(f,JSON.stringify(res));
                    done()
                    assert.equal(res.width_in,res.width,'width of images')
                })
            });    
        }
      });

    describe('IMG size Check',()=>{
        let file='test/data/2023-07-09T06 33 56.012Z~VENUE~jparagj$gmail.com~1P6A7976.jpg'
        let size=fs.statSync(file).size
        for (let quality of [20,30,40,60,70,80,90])
            for (let scale of [.1,.2,.3,.4,.5,.6,.7,.8,.9]) 
                for (let progressive of [true,false]) {
                    let outfile=`test/out/out_${scale*100}x_${progressive?"P":"X"}_${quality}.jpg`
                    it(`S:${scale} ${progressive} Q:${quality}`,function (done) {
                        resizeImage(file,scale,quality,progressive,
                            outfile)
                            .then((x)=>{
                                debug(x,outfile,
                                    size,
                                    fs.statSync(outfile).size,
                                    Math.round(100*fs.statSync(outfile).size/size)
                                );
                                done()
                            }).catch(console.error)
                    })
                }
    })
   
});

describe('IMG quality Check',()=>{
    let file='test/data/2023-07-09T06 33 56.012Z~VENUE~jparagj$gmail.com~1P6A7976.jpg'
    let size=fs.statSync(file).size
    scale=[.5,.75,1.25,1.5]
    this.timeout=5000
    for (let param of ['brightness','lightness','contrast','saturation'])
        for (let s of scale)  {
                let outfile=`test/out/out_${param}_${s*100}.jpg`

                it(outfile,function (done) {
                    modulateImage(file,param,s,
                        outfile)
                        .then((x)=>{
                            debug(x,outfile,
                                size,
                                fs.statSync(outfile).size,
                                Math.round(100*fs.statSync(outfile).size/size)
                            );
                            done()
                        }).catch(console.error)
                })
            }

});
async function modulateImage(input,param,scale,output){
    let img = new sharp(input).rotate()
    let img_m;
    await img.metadata().then((x)=>{img_m=x})
    const RESIZE_OPTION =        {
        width: 3000,
        fit: sharp.fit.inside,
        position: sharp.strategy.entropy
        }
    const JPG_OPTIONS = {quality: 40, progressive: true}
    let options={}
    options[param]=scale;
    let img_new=await img.modulate(  options )
                .jpeg(    JPG_OPTIONS)
                .withMetadata()
                .toFile(output)
    .then(outputMeta=>{
        let r = ({format,height,width,size,orientation}) => ({format,height,width,size,orientation})
        return Object.assign(r(outputMeta) ,
                    {file:input,
                     width_in:img_m.width,
                    }
         )     
    })
    .catch(console.error);
    
}

async function resizeImage(input,scale,quality,progressive,output){
    let img = new sharp(input).rotate()
    let img_m;
    await img.metadata().then((x)=>{img_m=x})
    const RESIZE_OPTION =        {
        width: Math.floor(img_m.width * scale),
        fit: sharp.fit.inside,
        position: sharp.strategy.entropy
        }
    const JPG_OPTIONS = {quality: quality, progressive: progressive}

    let img_new=await img.resize(  RESIZE_OPTION )
                .jpeg(    JPG_OPTIONS)
                .withMetadata()
                .toFile(output)
    .then(outputMeta=>{
        let r = ({format,height,width,size,orientation}) => ({format,height,width,size,orientation})
        return Object.assign(r(outputMeta) ,
                    {file:input,
                     width_in:img_m.width,
                    }
         )     
    })
    .catch(console.error);
    
}

async function test_watermark(input,watermark,output){
    let img = new sharp(input).rotate()
    let wm = new sharp(watermark)
    let img_m,wm_m;
    await img.metadata().then((x)=>{img_m=x})
    await wm.metadata().then((x)=>{wm_m=x})
    // debug(">>>",watermark,output)
    adjWm=await wm.resize({ width: img_m.width}).toBuffer()
    // debug(img_m,wm_m,watermark,output,"XXX")
    
    return img
    .composite([{ input: adjWm,gravity: 'south',// position:'top',//gravity: 'bottom'
                  }])
    .toFile(output)
    .then(outputMeta=>{
        // subsetKeys={'format','height','width'}
        let r = ({format,height,width,size,orientation}) => ({format,height,width,size,orientation})
        return Object.assign(r(outputMeta) ,
        // img_m
                    {file:input,
                     width_in:img_m.width,
                    }
         )     
    })
    .catch(console.error);
    
}


async function test_all() {
    let path='/m/runpix/functions/test/master/images'
    let result=[];
    for (let f of fs.readdirSync(path)){
        // filter
        if (!f.includes('6')) continue;
        if (!f.match(/.*\.(png|jpg)/i) )
            continue;
        debug(">>>>>>>>>>>",f)
        
        let res = await procIMG(path, f);
        result.push(res)
        
    }
    debug(result)
    return result
}
async function procIMG(path, f) {
    let start = new Date();
    let stat = fs.statSync(`${path}/${f}`);
    res = await test_watermark(`${path}/${f}`,
        "\\i\\pcmc\\werun\\we23\\medalbib\\werun23 frame v1.png",
        `${path}/../../out/${f.replace(".", "_")}.jpg`);
    let durn = new Date() - start;
    return Object.assign(res,
        {fsize:stat.size,
        size_chg: Math.round(res.size/stat.size*1000)/10,
        dur: durn, 
        });
}

