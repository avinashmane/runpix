import Aura from '@primevue/themes/aura';
import { definePreset } from '@primevue/themes';

export const MyPreset = definePreset(Aura, {
    locale: {
        emptyMessage: 'Loading data...',
    },
    semantic: {
        primary: {
            50: '{indigo.50}',
            100: '{indigo.100}',
            200: '{indigo.200}',
            300: '{indigo.300}',
            400: '{indigo.400}',
            500: '{indigo.500}',
            600: '{indigo.600}',
            700: '{indigo.700}',
            800: '{indigo.800}',
            900: '{indigo.900}',
            950: '{indigo.950}'
        },
        colorScheme: {
            light: {
                formField: {
                    hoverBorderColor: '{primary.color}'
                }
            },
            dark: {
                formField: {
                    hoverBorderColor: '{primary.color}'
                }
            }
        },
    },
    components:{
        button:{
            padding:{x: '.2rem', y: '.1rem'},      
            roundedBorderRadius:"1rem"
        },
        stepper:{
            stepTitleColor: '{primary.700}'}
    },

});

