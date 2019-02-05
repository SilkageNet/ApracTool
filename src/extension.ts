import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 *地址参数接口
 *
 * @interface IPathArgs
 */
interface IPathArgs {
	$mid?: number;
	fsPath?: string;
	external?: string;
	path?: string;
	scheme?: string;
}

/**
 *消息提示
 *
 * @param {string} message
 */
const showMessage = (message: string) => vscode.window.showInformationMessage(message);

/**
 *创建模板
 *
 * @param {string} templateName
 * @param {string} path
 */
const createTemplate = (templateName: string, dirPath: string) => {
	if (!templateName || !path) { return; }
	if (!/^[a-zA-Z0-9_.]{3,50}$/.test(templateName)) {
		showMessage(`模板名:'${templateName}'格式错误`);
		return;
	}
	const rootDir = vscode.workspace.getConfiguration().get('apractool.rootDir', './src/www');
	const wwwPath = path.join(<string>vscode.workspace.rootPath, rootDir);
	const templateArray: string[] = templateName.split('.');
	const name = templateArray.pop();
	const namespce = templateArray.join('.') || (path.resolve(dirPath) === wwwPath ? 'Base' : path.parse(dirPath).name);
	['gspx', 'js', 'jsx'].forEach(ext => {
		const fileName = `${name}.${ext}`;
		const filePath = path.join(dirPath, fileName);
		fs.exists(filePath, (exists: boolean) => {
			if (exists) {
				showMessage(`${fileName}已存在`);
				return;
			}
			fs.readFile(path.join(__dirname, 'static', `.temp${ext}`), (err: NodeJS.ErrnoException, data: Buffer) => {
				if (err) {
					showMessage(err.message);
					return;
				}
				const writeData = data.toString()
					.replace(/{NamespaceAndFileName}/g, `${namespce}.${name}`)
					.replace(/{Namespace}/g, namespce)
					.replace(/{FileName}/g, <string>name);
				fs.writeFile(filePath, writeData, {}, (err: NodeJS.ErrnoException) => err && showMessage(err.message));
			});
		});
	});
};

/**
 *ApracTool处理器
 *
 * @param {IPathArgs} args
 */
const apracToolHandler = (args: IPathArgs) => vscode.window.showInputBox({ placeHolder: '请输入模板名称：(包含命名空间,eg:Namespace.Template)' }).then(templateName => createTemplate(<string>templateName, <string>args.fsPath));

/**
 *插件被激活时
 *
 * @export
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('Welcome to the ApracTool tool!');
	context.subscriptions.push(vscode.commands.registerCommand('extension.ApracTool', apracToolHandler));
}

/**
 *插件被卸载时
 *
 * @export
 */
export function deactivate() { }
