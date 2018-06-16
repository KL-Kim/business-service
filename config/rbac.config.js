/**
 * Role based Access Control Config
 * @export {AccessControl}
 * @version 0.0.1
 */

const grants = {
	"guest": {
		business: {
			"read:any": ["*", "!state", "!reports", "!priority"],
		},
		category: {
			"read:any": ["*"],
		},
		tag: {
			"read:any": ["*"],
		},
		pca: {
			"read:any": ["*"],
		}
	},
	"regular": {
		business: {
			"read:any": ["*", "!state", "!reports", "!priority"],
		},
		category: {
			"read:any": ["*"],
		},
		tag: {
			"read:any": ["*"],
		},
		pca: {
			"read:any": ["*"],
		}
	},
	"manager": {
		business: {
			"read:any": ["*"],
			"create:any": ["*"],
			"update:any": ["*"],
		},
		category: {
			"read:any": ["*"],
			"create:any": ["*"],
			"update:any": ["*"],
			"delete:any": ["*"],
		},
		tag: {
			"read:any": ["*"],
			"create:any": ["*"],
			"update:any": ["*"],
			"delete:any": ["*"],
		},
		pca: {
			"read:any": ["*"],
		}
	},
	"admin": {
		business: {
			"read:any": ["*"],
			"create:any": ["*"],
			"update:any": ["*"],
		},
		category: {
			"read:any": ["*"],
			"create:any": ["*"],
			"update:any": ["*"],
			"delete:any": ["*"],
		},
		tag: {
			"read:any": ["*"],
			"create:any": ["*"],
			"update:any": ["*"],
			"delete:any": ["*"],
		},
		pca: {
			"read:any": ["*"],
			"update:any": ["*"],
		}
	},
	"god": {
		business: {
			"read:any": ["*"],
			"create:any": ["*"],
			"update:any": ["*"],
			"delete:any": ["*"]
		},
		category: {
			"read:any": ["*"],
			"create:any": ["*"],
			"update:any": ["*"],
			"delete:any": ["*"],
		},
		tag: {
			"read:any": ["*"],
			"create:any": ["*"],
			"update:any": ["*"],
			"delete:any": ["*"],
		},
		pca: {
			"read:any": ["*"],
			"update:any": ["*"],
		}
	}
};

export default grants;
