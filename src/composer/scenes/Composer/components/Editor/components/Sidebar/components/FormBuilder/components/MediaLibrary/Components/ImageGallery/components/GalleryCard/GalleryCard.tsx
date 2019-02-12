import { getImgUrl } from '@source/composer/utils';
import { Icon } from 'antd';
import * as React from 'react';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IGalleryCardProps {
  toggleEdit: (image: object) => void;

  placeImg: (image: object) => void;
  // tslint:disable:no-any
  image: any;
}

const GalleryCard: React.SFC<IGalleryCardProps> = ({ toggleEdit, image }) => {
  return (
    <div className={'ant-upload-list ant-upload-list-picture-card'}>
      <div
        className="ant-upload-list-item ant-upload-list-item-done"
        style={{ cursor: 'pointer' }}
        onClick={() => toggleEdit(image)}
      >
        <div className="ant-upload-list-item-info">
          <div className={'mediaLibrary__gallery__img'} style={{ backgroundImage: `url(${getImgUrl(image)})` }} />
        </div>

        <div className={'ant-upload-list-item-actions'}>
          <Icon type="eye-o" style={{ fontSize: '26px', color: 'white', width: '100%' }} />
        </div>  
      </div>
    </div>
  );
};

export default GalleryCard;
