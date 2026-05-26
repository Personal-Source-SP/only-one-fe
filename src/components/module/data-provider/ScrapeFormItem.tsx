'use client';

import { FormInstance } from '@/components/custom';
import { ScraperServiceEnum } from '@/enums';
import { NDataProvider } from '@/interfaces';
import { JSX } from 'react';
import { LocalScrapeForm } from './LocalScrapeForm';
import { ScrapeApiForm } from './ScrapeApiForm';
import { ScrapeGenericForm } from './ScrapeGenericForm';

type ScrapeFormItemProps = {
    url: string;
    form: FormInstance<any>;
    formUrls: string[];
    cookies: Record<string, string>;
    headers: Record<string, string>;
    dataProvider?: NDataProvider.IDataProvider;
    scraperService: ScraperServiceEnum;

    onRegistered: (response: NDataProvider.RegisterLocalFolderResponse) => void;
    renderFormUrl: (field: string, index?: number) => JSX.Element;
};

export const ScrapeFormItem = ({
    url,
    form,
    formUrls,
    cookies,
    headers,
    dataProvider,
    scraperService,
    onRegistered,
    renderFormUrl,
}: ScrapeFormItemProps) => {
    switch (scraperService) {
        case ScraperServiceEnum.GENERIC: {
            return (
                <ScrapeGenericForm
                    url={url}
                    form={form}
                    cookies={cookies}
                    headers={headers}
                    formUrls={formUrls}
                    renderFormUrl={renderFormUrl}
                />
            );
        }

        case ScraperServiceEnum.API: {
            return (
                <ScrapeApiForm
                    url={url}
                    form={form}
                    headers={headers}
                    cookies={cookies}
                    formUrls={formUrls}
                    renderFormUrl={renderFormUrl}
                />
            );
        }

        case ScraperServiceEnum.LOCAL: {
            return (
                <LocalScrapeForm
                    url={url}
                    dataProvider={dataProvider}
                    onRegistered={onRegistered}
                    renderFormUrl={renderFormUrl}
                />
            );
        }
    }
};
