<template>
	<!-- Bar -->
	<div class="grid">
		<div class="col">
			<Toolbar>
					<template #start>
							<Button icon="pi pi-plus" class="mr-2" label="New" @click="openNew" />
							<Button icon="pi pi-chart-bar" class="mr-2" label="Dashboard" disabled/>
					</template>
					<template #end>
						<Button icon="pi pi-sign-out" class="mr-2" label="Exit" @click="logOut" />
						        <!-- <template #end>
            <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" />
            <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)"  />
        </template> -->
				</template>
			</Toolbar>
		</div>
	</div>

	<!-- Add Modal -->
	<Dialog 
		v-model:visible="tradeDialog" 
		:modal="true"
		header="Trade Details" class="p-fluid" :style="{width: '450px'}">
		<div class="field" v-for="col of columns" :key="col.field">
			<template v-if="col.editable">
				<label for ="col.field">{{ col.header }}</label>
				<template v-if="col.options">
					<Dropdown v-model="trade[col.field]" :options="col.options" required/>
				</template>
				<template v-else-if="col.type === 'datepicker'"> <!-- date check -->
					<Calendar v-model="trade[col.field]" :inputStyle="{'width': '100%'}" :readonlyInput="false" :dateFormat="'yy-mm-dd'"></Calendar>
				</template>
				<template v-else-if="col.type === 'float'"> <!-- numbers check -->
					<InputNumber v-model="trade[col.field]" :minFractionDigits="2" required/>
				</template>
				<template v-else-if="col.type === 'text'">
					<Textarea v-model="trade[col.field]" rows="3" cols="20"/>
				</template>
				<template v-else>
					<InputText v-model="trade[col.field]" required/>
				</template>
			</template>
		</div>
		<template #footer>
			<div><InlineMessage v-if="showAddError" ref="errMsg"/></div>
			<div>
				<Button label="Cancel" icon="pi pi-times" text @click="closeNew"/>
				<Button label="Save" icon="pi pi-check" text @click="saveTrade" />
			</div>
		</template>
	</Dialog>


</template>


<script setup>
    import TestBlock from '@/components/TestBlock.vue'
		import { columns } from '@/components/Columns.vue'

		import {ref} from 'vue';

		const trade = ref({});
		const tradeDialog = ref(false);
		const showAddError = ref(false);
		const errMsg = ref('');

		const openNew = () => {
			trade.value = {};
			trade.value.category = 'Long';
			trade.value.open_date = new Date();
			showAddError.value = true;
			errMsg.value = 'Something-someiting';
			tradeDialog.value = true;

  	}

		const closeNew=() => {
			tradeDialog.value = false;
		}

		const saveTrade=() => {
			console.log("saved");
			closeNew();
		}

		const logOut = () => {
			console.log("Logging out");
		}

</script>
