// base
import { useState, useEffect, useCallback } from 'react';

export interface TreeNode<T> {
  title: string;
  key: string;
  value: string;
  children: TreeNode<T>[];
  data?: T;
}

export const useTree = <T>(initTree?: TreeNode<T>) => {
  const [tree, setTree] = useState<TreeNode<T>[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>();
  const [selectedNode, setSelectedNode] = useState<TreeNode<T>>();

  const getTreeNode = useCallback(
    (cloneTree: TreeNode<T>[], selectedKey: string) => {
      const keys = selectedKey.split('-').slice(1);

      let key = '0';

      const treeNode = keys.reduce<TreeNode<T> | undefined>((node, k) => {
        key = key + '-' + k;

        if (!node) {
          node = cloneTree.find((item) => item.key === key);
        } else {
          node = node.children.find((item) => item.key === key);
        }

        return node;
      }, undefined);

      return treeNode;
    },
    []
  );

  useEffect(() => {
    if (initTree) {
      setTree(JSON.parse(JSON.stringify(initTree)));
    }
  }, [initTree]);

  const clone = (): TreeNode<T>[] => {
    return JSON.parse(JSON.stringify(tree));
  };

  const select = (selectedKey?: string) => {
    if (!selectedKey) {
      clear();

      return;
    }

    const cloneTree = clone();

    const selectedNode = getTreeNode(cloneTree, selectedKey);

    setSelectedNode(selectedNode);
    setSelectedKey(selectedKey);

    return selectedNode;
  };

  const add = (values: { title: string; data?: T }) => {
    const cloneTree = clone();

    if (selectedKey) {
      const selectedNode = getTreeNode(cloneTree, selectedKey);

      if (selectedNode) {
        let index = selectedNode.children.reduce((ac, item, i, arr) => {
          const keys = item.key.split('-').map((k) => Number.parseInt(k));

          if (ac < keys[keys.length - 1]) {
            ac = keys[keys.length - 1];
          }

          return ac;
        }, 0);

        index += 1;

        selectedNode.children.push({
          key: `${selectedNode.key}-${index}`,
          title: values.title,
          value: `${selectedNode.key}-${index}`,
          children: [],
          data: values.data,
        });
      }
    } else {
      let index = 0;

      if (cloneTree.length > 0) {
        index = cloneTree.reduce((ac, item) => {
          const keys = item.key.split('-').map((k) => Number.parseInt(k));

          if (ac < keys[keys.length - 1]) {
            ac = keys[keys.length - 1];
          }

          return ac;
        }, index);

        index += 1;
      }

      cloneTree.push({
        key: `0-${index}`,
        title: values.title,
        value: `0-${index}`,
        children: [],
        data: values.data,
      });
    }

    setTree(cloneTree);
  };

  const remove = () => {
    if (!selectedKey) {
      return;
    }

    let cloneTree = clone();

    const keys = selectedKey.split('-').slice(1);

    keys.reduce<TreeNode<T> | undefined>((ac, k, i, arr) => {
      if (arr.length === 1) {
        cloneTree = cloneTree.filter((item, i) => item.key !== selectedKey);

        return undefined;
      }

      if (!ac) {
        ac = cloneTree.find((item) => selectedKey.indexOf(item.key) === 0);
      } else if (arr.length - 1 > i) {
        ac = ac.children.find((item) => selectedKey.indexOf(item.key) === 0);
      } else {
        ac.children = ac.children.filter((item) => item.key !== selectedKey);
      }

      return ac;
    }, undefined);

    setTree(cloneTree);

    clear();
  };

  const modify = (values: { title?: string; data?: T }) => {
    const cloneTree = clone();

    if (selectedKey) {
      const selectedNode = getTreeNode(cloneTree, selectedKey);

      if (selectedNode) {
        if (values.title) {
          selectedNode.title = values.title;
        }

        if (selectedNode.data) {
          Object.assign(selectedNode.data, values.data);
        } else {
          selectedNode.data = values.data;
        }

        setTree(cloneTree);
        setSelectedNode(selectedNode);
        setSelectedKey(selectedKey);

        return cloneTree;
      }
    }
    return cloneTree;
  };

  const sort = (children: TreeNode<T>[]) => {
    const cloneTree = clone();

    if (selectedKey) {
      const selectedNode = getTreeNode(cloneTree, selectedKey);

      if (selectedNode) {
        selectedNode.children = children;

        setTree(cloneTree);
        setSelectedNode(selectedNode);
        setSelectedKey(selectedKey);
      }
    } else {
      setTree(children);
    }
  };

  const clear = () => {
    setSelectedKey(undefined);
    setSelectedNode(undefined);
  };

  return {
    tree,
    selectedKey,
    selectedNode,
    select,
    add,
    remove,
    modify,
    sort,
    clear,
  };
};
