/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import Logger from '../../common/logger';
import { dispose } from '../../common/utils';

export interface BaseTreeNode {
	reveal(element: TreeNode, options?: { select?: boolean; focus?: boolean; expand?: boolean | number }): Thenable<void>;
	refresh(treeNode?: TreeNode): void;
	view: vscode.TreeView<TreeNode>;
}

export type TreeNodeParent = TreeNode | BaseTreeNode;

export const EXPANDED_QUERIES_STATE = 'expandedQueries';

export abstract class TreeNode implements vscode.Disposable {
	protected children: TreeNode[];
	childrenDisposables: vscode.Disposable[];
	parent: TreeNodeParent;
	label?: string;
	accessibilityInformation?: vscode.AccessibilityInformation;
	id?: string;

	constructor() { }
	abstract getTreeItem(): vscode.TreeItem;
	getParent(): TreeNode | undefined {
		if (this.parent instanceof TreeNode) {
			return this.parent;
		}
	}

	async reveal(
		treeNode: TreeNode,
		options?: { select?: boolean; focus?: boolean; expand?: boolean | number },
	): Promise<void> {
		try {
			await this.parent.reveal(treeNode || this, options);
		} catch (e) {
			Logger.error(e, 'TreeNode');
		}
	}

	refresh(treeNode?: TreeNode): void {
		return this.parent.refresh(treeNode);
	}

	async cachedChildren(): Promise<TreeNode[]> {
		if (this.children && this.children.length) {
			return this.children;
		}
		return this.getChildren();
	}

	async getChildren(): Promise<TreeNode[]> {
		if (this.children && this.children.length) {
			dispose(this.children);
			this.children = [];
		}
		return [];
	}

	updateCheckbox(_newState: vscode.TreeItemCheckboxState): void { }

	public updateParentCheckbox(): boolean { return false; }

	dispose(): void {
		if (this.childrenDisposables) {
			dispose(this.childrenDisposables);
			this.childrenDisposables = [];
		}
	}
}

export class LabelOnlyNode extends TreeNode {
	public readonly label: string = '';
	constructor(label: string) {
		super();
		this.label = label;
	}
	getTreeItem(): vscode.TreeItem {
		return new vscode.TreeItem(this.label);
	}

}