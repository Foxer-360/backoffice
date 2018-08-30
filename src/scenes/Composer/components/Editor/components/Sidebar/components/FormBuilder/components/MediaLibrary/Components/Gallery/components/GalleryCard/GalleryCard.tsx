import * as React from 'react';
import { Icon, Button, Popconfirm } from 'antd';

export interface GalleryCardProps {
  toggleEdit: () => void;
}

const GalleryCard: React.SFC<GalleryCardProps> = ({ toggleEdit }) => {
  return (
    <div className={'ant-upload-list ant-upload-list-picture-card'}>

      <div className="ant-upload-list-item ant-upload-list-item-done">
        <div className="ant-upload-list-item-info">
          <div
            className={'mediaLibrary__gallery__img'}
            style={{
              backgroundImage:
                'url(https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png)',
            }}
          />
        </div>

        <span className={'ant-upload-list-item-actions'}>
          <Icon type="eye-o" onClick={() => toggleEdit()} />

          <Popconfirm title="Are you sure, you want to remove this image ?">
          <Icon type="delete" />
            </Popconfirm>

        </span>
      </div>
    </div>
  );
};

export default GalleryCard;
