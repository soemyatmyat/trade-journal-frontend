
<template>
    <a href="#" @click="showTemplate">Reveal a Guest Pass</a>
    <div class="card flex justify-content-center">
        <Toast position="bottom-center" group="bc" @close="onClose">
            <template #message="slotProps">
                <div class="flex flex-column align-items-start" style="flex: 1">
                    <div class="flex align-items-center gap-2">
                        <span class="font-bold text-900">{{ slotProps.message.title }}</span>
                    </div>
                    <div class="font-medium text-lg my-3 text-900">{{ slotProps.message.text1 }}<br>{{ slotProps.message.text2 }}</div>
                </div>
            </template>
        </Toast>
    </div>
</template>

<script setup>
import { useToast } from "primevue/usetoast";
import { ref } from 'vue';

const toast = useToast();
const visible = ref(false);

const showTemplate = () => {
    if (!visible.value) {
        toast.add({ severity: 'success', title: 'Guest Pass', text1: 'username: guest-5291', text2:'password: ]Jvx8BVDnB+{w', group: 'bc' });
        visible.value = true;
    } 
    setTimeout(() => {
        toast.removeAllGroups();
        visible.value = false;
    }, 10000);
};

const onClose = () => {
    visible.value = false;
}
</script>
