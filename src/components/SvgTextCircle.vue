
<template>
    <!-- SVGTExtCircle -->
    <div :class="`w-[${width}] h-[${width}]  `">

        <div :class="`${pt?.root?.class || ''}`"
            :style="`width:${width}px;height:${width}px;border-radius: 50%;`"> 
            <!-- background-image: url('${src}');background-size: cover ; -->
            <svg :viewBox="viewBox" :width="width" id="s">

                <path :id="`upper${key}`" :d="`M ${fontsz/2},${r_out}
                            A ${r_mid},${r_mid} 0 1,1 ${r_mid+r_out},${r_out}`" 
                            _fill="red" :stroke-width="fontsz" opacity="0.0" stroke="black"/> 
                <path :id="`lower${key}`" :d="`M ${fontsz/2},${r_out}
                            A ${r_mid},${r_mid} 0 1,0 ${r_mid+r_out},${r_out}`" 
                            _fill="red" :stroke-width="fontsz" opacity="0.0" stroke="black"/>  
                <!-- <path :id="`cir${key}`" :d="`M ${r_out},0
                            A ${r_out},${r_out} 0 1,0 ${r_out},${r_out*2}
                            A ${r_out},${r_out} 0 1,0 ${r_out},0`" 
                            fill="red" opacity="0.2" stroke="black"/>  -->
                <defs>

                    <!-- <circle :cx="r_out" :cy="r_out" :r="r_in" opacity="0.2" /> -->
                </defs>
        
                <circle id="rim" :cx="width/2" :cy="width/2" :r="width/2" 
                    opacity="0.3" 
                    :fill="`${pt?.rim?.fill||white}`"
                    :class="`${pt?.rim?.class || ''}`" />
                <!-- <text :class="`upper ctext ${pt?.rim?.class || ''}`" :transform="`rotate(90,${r_out},${r_out})`" :font-size="`${fontsz}`"
                    text-anchor="middle" :x="`${3.14 * r_in}`">
                    <textPath :href="`#cir${key}`" dominant-baseline="text-top">
                        {{ upper }}
                    </textPath>
                </text>
                <text :class="`lower ctext ${pt?.rim?.class || ''}`" :transform="`rotate(270,${r_out},${r_out})`" text-anchor="middle"
                    :x="`${3.14 * r_in}`" dy="-2%" :font-size="`${fontsz}`">
                    <textPath :href="`#cir${key}`" dominant-baseline="hanging " side="right" :class="`${pt?.rim?.class || ''}`">
                        {{ lower }}
                    </textPath>
                </text> -->
                <text :class="`upper ctext ${pt?.rim?.class || ''}`" :font-size="`${fontsz}`"
                    text-anchor="middle" :x="`${3.14 / 2 * r_mid}`">
                    <textPath :href="`#upper${key}`" dominant-baseline="central">
                        {{ upper }}
                    </textPath>
                </text>
                <text :class="`lower ctext ${pt?.rim?.class || ''}`" text-anchor="middle"
                    :x="`${3.14 / 2 * r_mid}`"  :font-size="`${fontsz}`">
                    <textPath :href="`#lower${key}`" dominant-baseline="central "  :class="`${pt?.rim?.class || ''}`">
                        {{ lower }}
                    </textPath>
                </text>
<!-- {{ props }} -->
                <text :x="r_out" :y="r_out" class="title z-100" text-anchor="middle" 
                    >
                    <tspan :x="r_out" :dy="-titleOffset" 
                        :dominant-baseline="pt?.title?.baseline"
                        :class="`${pt?.title?.class || ''}`" :font-size="titleFontSize" >{{ title }}</tspan>
                    <tspan :x="r_out" :dy="titleOffset" :font-size="pt?.subtitle?.fontSize || fontsz" 
                        :dominant-baseline="pt?.subtitle?.baseline"
                        :class="`${pt?.subtitle?.class || ''}`"
                        text-length="100"
                        style="white-space: wrap;">
                        {{ subtitle }}
                        <slot :class="`${pt?.slot?.class || ''}`"/>
                    </tspan>
                </text>
            </svg>
        </div>
    </div>
</template>

<script setup>
/**
 * passthru pt
 * root:
 * circle:
 * rim:
 * 
 */
const props = defineProps({
    width: { type: String, default: "400" },
    // height: { type: String, default: "400" },
    title: { type: String, },
    subtitle: { type: String, },
    key_: { type: String, },
    upper: { type: String, },
    lower: { type: String, },
    src: String,
    pt: Object,
    margin: Number,
    // titleBaseline: String,
    debug: Boolean
})


/**
 * https://www.smashingmagazine.com/2019/03/svg-circle-decomposition-paths/
 * 
 */
import { ref, toRef, computed } from 'vue'



const r_out = ref(parseFloat(props.width) / 2),
    _margin=parseInt(props.margin||0),
    viewBox = computed(() => `-${_margin} -${_margin} ${(r_out.value + _margin) * 2} ${(r_out.value + _margin) * 2}`),
    fontsz = computed(() => props.pt?.rim?.fontSize || Math.max(10, parseFloat(props.width) / 8)),
    titleFontSize = computed(() => props.pt?.title?.fontSize || (fontsz.value * 2.2)),
    titleOffset = computed(()=>(props.title && props.subtitle )? titleFontSize.value * 1.2 : 0),
    r_in = computed(() => parseFloat(props.width / 2) - fontsz.value),
    r_mid=computed(()=>parseFloat(props.width / 2) - fontsz.value/2),
    key = computed(() => props.key_ || props.width || ''),
    margin = ref(props.margin || props.width * 0.0)



</script>

<style scoped>
.upper {}

.lower {}

.ctext {
    /* font-size: 3rem; */
    /* stroke: red; */
    /* fill: white; */
    text-shadow: .05rem  .05rem lightgray;
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    font-weight: 300;
    text-transform: uppercase;
    /* text-anchor: middle; */
    text-align: center;
    font-stretch: extra-expanded;
}

.title {
    /* font-size: 7rem; */
    text-shadow: 0.05rem 0.05rem lightgray;
    font-weight: 200;
    text-align: center;
    dominant-baseline: hanging;
}

.subtitle {
    font-size: 3rem;
    text-shadow: 0.05rem 0.05rem lightgray;
}

.rim {
    /* stroke: whitesmoke; */
    /* stroke-width: 1rem; */
}

.circle {
    fill: lightgoldenrodyellow;
    box-shadow: 0.05rem 0.05rem gray;
}

/* Use -webkit- only if supporting: Chrome < 54, iOS < 9.3, Android < 4.4.4 */

.shadow {
    -webkit-filter: drop-shadow(3px 3px 2px rgba(0, 0, 0, .7));
    filter: drop-shadow(3px 3px 2px rgba(0, 0, 0, .7));
    /* Similar syntax to box-shadow */
}
</style>